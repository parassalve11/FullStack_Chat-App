import { User } from "@/context/appContext";
import { Menu, UserCircle } from "lucide-react";

interface ChatHeaderProps {
  user: User | null;
  setShowSidebar: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

export default function ChatHeader({
  user,
  setShowSidebar,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) {
  const isUserOnline = user && onlineUsers.includes(user._id);

  return (
    <>
      {/* Mobile toggle icon */}
      <div className="sm:hidden p-4 fixed top-4 right-4 z-30">
        <button
          className="p-4 bg-gray-800 hover:bg-gray-700 rounded-2xl transition-colors"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="size-5 text-gray-200" />
        </button>
      </div>
      {/* chat header */}
      <div className="mb-6 bg-gray-800 rounded-2xl border w-full border-gray-700 p-6 ">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="relative">
                <div className="size-14 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserCircle className="size-8 text-gray-300" />
                </div>
                {/* online user */}
                {isUserOnline && (
                  <span
                    className="absolute -bottom-1 -right-1 size-5  rounded-full
                         bg-green-500  border-2 border-gray-800 "
                  >
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-75"></span>
                  </span>
                )}
              </div>
              {/* user info */}
              <div className=" flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-bold text-2xl text-white truncate">
                    {user.name}
                  </h2>
                </div>
                {/* shwo typoing */}
                <div className="flex items-center gap-2">
                  {isTyping ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="size-1.5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="size-1.5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <span className="text-blue-500 font-semibold">
                          Typing...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-2 rounded-full ${
                          isUserOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      ></div>
                      <span
                        className={` text-sm font-semibold ${
                          isUserOnline ? "text-green-500" : "text-gray-400"
                        }`}
                      >
                        {isUserOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center  gap-4">
                <div className="size-14 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserCircle className="size-8 text-gray-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-400">
                    Select the Conversation
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
