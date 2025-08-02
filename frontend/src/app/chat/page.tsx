"use client";

import ChatsSidebar from "@/components/ChatsSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/appContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import { SocketData } from "@/context/socketContext";

export interface Message {
  _id: string;
  chatId: string;
  content?: string;
  sender?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const {
    isAuth,
    loading,
    logoutUser,
    user: loggedInUser,
    users,
    fetchChats,
    setChats,
    chats,
  } = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const handleLogout = () => logoutUser();

  const { onlineUsers, socket } = SocketData();

  async function getChats() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.get(
        `${chat_service}/chats/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Failed to load chats");
    }
  }

  const moveChatToTop = (
    chatId: string,
    newMessage: any,
    updatedUnseenCount: boolean
  ) => {
    setChats((prev) => {
      if (!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat.chat._id === chatId // Fixed typo
      );

      if (chatIndex !== -1) {
        const [movedChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...movedChat,
          chat: {
            ...movedChat.chat,
            latestMessage: {
              text: newMessage.content || "📸 image",
              sender: newMessage.sender,
            },
            updatedAt: new Date().toISOString(),
            unSeenCount:
              updatedUnseenCount && newMessage.sender !== loggedInUser?._id
                ? (movedChat.chat.unSeenCount || 0) + 1
                : movedChat.chat.unSeenCount || 0,
          },
        };
        updatedChats.unshift(updatedChat);
      }
      return updatedChats;
    });
  };

  const resetUnseenCount = (chatId: string | null) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unSeenCount: 0,
            },
          };
        }
        return chat;
      });
    });
  };

  async function createChat(user: User) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${chat_service}/chats/new`,
        {
          userId: loggedInUser?._id,
          otherUserId: user?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchChats();
    } catch (error) {
      toast.error("Failed to create chat");
      console.error("Failed to create chat:", error);
    }
  }

  async function handleSendMessage(e: any, imageFile: File | null) {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;
    if (!selectedUser) return;

    // Stop typing indicator
    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("chatId", selectedUser);

    if (message.trim()) {
      formData.append("content", message);
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const { data } = await axios.post(
        `${chat_service}/chats/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update messages state
      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );

        if (!messageExists) {
          return [...currentMessages, data.message];
        }
        return currentMessages;
      });

      // Move chat to top and update latest message
      moveChatToTop(selectedUser, data.message, false);

      // Reset message input
      setMessage("");

      // Emit socket event to notify other users
      socket?.emit("sendMessage", data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
      console.error("Failed to send message:", error);
    }
  }

  const handleTyping = (value: any) => {
    setMessage(value);
    if (!selectedUser || !socket) return;

    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    const timeOut = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }, 2000);

    setTypingTimeOut(timeOut);
  };

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || [];
          const messageExists = currentMessages.some(
            (msg) => msg._id === message._id
          );

          if (!messageExists) {
            return [...currentMessages, message];
          }
          return currentMessages;
        });
      }
      // Move chat to top only if the message is from another user
      if (message.sender !== loggedInUser?._id) {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messagesSeen",(data) =>{
      console.log("Message seen by:" ,data);
      if(selectedUser === data.chatId){
        setMessages((prev) =>{
          if(!prev) return null;

          return prev.map((msg) =>{
            if(msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)){
              return{
                ...msg,
                seen:true,
                seenAt:new Date().toString()
              }
            }else if(msg.sender === loggedInUser?._id && !data.messageIds){
              return{
                 ...msg,
                seen:true,
                seenAt:new Date().toString()
              }
            }

            return msg
          })
        })
      }
    })

    socket?.on("userTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true);
      }
    });

    socket?.on("userStoppedTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messagesSeen")
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    };
  }, [selectedUser, socket, loggedInUser?._id]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        if (selectedUser) {
          await getChats();
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChat();
    setIsTyping(false);
    resetUnseenCount(selectedUser);
    socket?.emit("joinChat", selectedUser);

    return () => {
      socket?.emit("leaveChat", selectedUser);
      setMessages(null);
    };
  }, [selectedUser, socket]);

  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut);
      }
    };
  }, [typingTimeOut]);

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full text-white bg-gray-900 flex relative overflow-hidden">
      <ChatsSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        showAllUser={showAllUser}
        setShowAllUser={setShowAllUser}
        users={users}
        chats={chats}
        loggedInUser={loggedInUser}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />
      <div
        className="flex-1 flex flex-col items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10"
      >
        <ChatHeader
          user={user}
          setShowSidebar={setShowSidebar}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        />
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={loggedInUser}
        />
        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={handleTyping}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}