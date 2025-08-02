import axios from "axios";
import TryCatch from "../lib/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { getReceivorSocketId, io } from "../lib/socket.js";

export const createNewChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      res.status(400).json({ message: "Other user is not Found" });
      return;
    }

    const exisitingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },
    });

    if (exisitingChat) {
      res.json({ message: "chat already exist", chatId: exisitingChat?._id });
      return;
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
    });

    res.status(201).json({
      message: "New Chat is Createtd",
      chatId: newChat._id,
    });
  }
);

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(400).json({ message: "userId is missing" });
    return;
  }

  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);

      const unSeenCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/users/user/${otherUserId}`
        );

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unSeenCount,
          },
        };
      } catch (error) {
        console.log("error in getAll Chats Controller", error);
        return {
          user: { _id: otherUserId, name: "Unknown" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unSeenCount,
          },
        };
      }
    })
  );

  if (!chatWithUserData) {
    throw new Error("Chat data is empty");
  }
  res.json({
    chats: chatWithUserData,
  });
});

export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user?._id;
  const { chatId, content } = req.body;
  const imageFile = req.file;

  if (!senderId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!chatId) {
    res.status(400).json({ message: "ChatId not Found" });
    return;
  }
  if (!content && !imageFile) {
    res.status(401).json({ message: "Reuqied content or image to send" });
    return;
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404).json({ message: "Chats not found" });
    return;
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );

  if (!isUserInChat) {
    res.status(403).json({ message: "Do not soil another chats." });
    return;
  }

  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  );

  if (!otherUserId) {
    res.status(401).json({ message: "there is not another user" });
    return;
  }

  //scoket setup

  const receiverSocketId = getReceivorSocketId(otherUserId.toString());
  let isReceiverInChatRoom = false;

  if (receiverSocketId) {
    const receiverScoket = io.sockets.sockets.get(receiverSocketId);
    if (receiverScoket && receiverScoket.rooms.has(chatId)) {
      isReceiverInChatRoom = true;
    }
  }

  let messageData: any = {
    chatId: chat._id,
    sender: senderId,
    seen: isReceiverInChatRoom,
    seenAt: isReceiverInChatRoom ? new Date() : undefined,
  };

  if (imageFile) {
    (messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    }),
      (messageData.messageType = "image"),
      (messageData.content = content || "");
  } else {
    messageData.content = content;
    messageData.messageType = "text";
  }

  const message = new Message(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "📷 Image" : content;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        text: latestMessageText,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    { new: true }
  );

  //emit scokets

  io.to(chatId).emit("newMessage", savedMessage);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", savedMessage);
  }

  const senderSocketId = getReceivorSocketId(senderId.toString());
  if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", savedMessage);
  }

  if (isReceiverInChatRoom && senderSocketId) {
    io.to(senderSocketId).emit("MessagesSeen", {
      chatId: chatId,
      seenBy: otherUserId,
      messagesIds: [savedMessage._id],
    });
  }

  res.status(201).json({ message: savedMessage, sender: senderId });
});

export const getMessageByChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!chatId) {
      res.status(400).json({ message: "ChatId is Missing" });
      return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({ message: "Chats not found" });
      return;
    }

    const isUserInChat = chat.users.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isUserInChat) {
      res.status(403).json({ message: "Do not soil another chats." });
      return;
    }

    const markMessagesToSeen = await Message.find({
      chatId: chatId,
      sender: { $ne: userId },
      seen: false,
    });

    await Message.updateMany(
      {
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find(
      (id) => id.toString() !== userId.toString()
    );

    try {
      const { data } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/users/user/${otherUserId}`
      );
      if (!otherUserId) {
        res.status(400).json({ message: "Other user is Missing" });
        return;
      }
      //scoket work
      if(markMessagesToSeen.length > 0){
        const otherUserSocketId = getReceivorSocketId(otherUserId.toString());
        if(otherUserSocketId){
          io.to(otherUserSocketId).emit("MessagesSeen",{
            chatId:chatId,
            seenBy:userId,
            messagesIds:markMessagesToSeen.map((msg) => msg._id)
          })
        }
      }

      res.json({
        messages,
        user: data,
      });
    } catch (error) {
      console.log(error);
      res.json({
        messages,
        user: { _id: otherUserId, name: "Unkown User" },
      });
    }
  }
);
