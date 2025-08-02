import { Message } from "@/app/chat/page";
import { User } from "@/context/appContext";
import { useEffect, useMemo, useRef } from "react";
import moment from "moment";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

export default function ChatMessages({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null); // Reference the scrollable container
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Filter unique messages
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) {
        return false;
      }
      seen.add(message._id);
      return true;
    });
  }, [messages]);

  // Scroll to bottom when messages or selectedUser changes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedUser, uniqueMessages]);

  return (
    <div className="flex-1 overflow-hidden w-full p-4">
      <div
        ref={messagesContainerRef} // Attach ref to the scrollable container
        className="h-full max-h-[70vh] overflow-y-auto p-2 space-y-2 custom-scroll"
      >
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20">
            Select the user to start chatting 📬
          </p>
        ) : (
          <div>
            {uniqueMessages.map((el, index) => {
              const isSentByMe = el.sender === loggedInUser?._id;
              const uniqueKey = `${el._id}-${index}`;
              return (
                <div
                  className={`flex flex-col justify-between gap-1 mt-2 ${
                    isSentByMe ? "items-end" : "items-start"
                  }`}
                  key={uniqueKey}
                >
                  <div
                    className={`rounded-lg p-3 max-w-sm ${
                      isSentByMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {el.messageType === "image" && el.image && (
                      <div className="relative group">
                        <img
                          src={el.image.url}
                          alt="shared image"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {el.content && <p className="mt-1">{el.content}</p>}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs text-gray-400 ${
                      isSentByMe ? "pr-2 flex-row-reverse" : "pl-2"
                    }`}
                  >
                    <span>{moment(el.createdAt).format("hh:mm A . MMM D")}</span>
                    {isSentByMe && (
                      <div className="flex items-center ml-1">
                        {el.seen ? (
                          <div className="flex items-center gap-1 text-blue-400">
                            <CheckCheck className="size-3" />
                            {el.seenAt && (
                              <span>{moment(el.seenAt).format("hh:mm A")}</span>
                            )}
                          </div>
                        ) : (
                          <Check className="size-3 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}