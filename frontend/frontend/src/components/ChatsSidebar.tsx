'use client'
import { User } from "@/context/appContext";
import {
  CornerDownLeft,
  CornerDownRight,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  SidebarOpen,
  UserCircle,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ChatSidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showAllUser: boolean;
  setShowAllUser: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (user: User) => void;
  onlineUsers: string[];
}

export default function ChatsSidebar({
  showSidebar,
  setSelectedUser,
  showAllUser,
  setShowAllUser,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setShowSidebar,
  handleLogout,
  createChat,
  onlineUsers,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside
      className={`fixed  z-20 bg-gray-900 left-0 top-0 h-screen w-80 sm:static 
     border-r border-gray-700  transform flex flex-col duration-300 
     ${
       showSidebar ? "translate-x-0" : "-translate-x-full"
     } sm:translate-x-0  transition-transform `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="sm:hidden flex justify-end mb-0">
          <button
            onClick={() => setShowSidebar(false)}
            className="p-4 hover:bg-gray-700 rounded-2xl transition-colors"
          >
            <X className="size-9 text-gray-300 p-2" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 flex justify-between rounded-2xl">
              <MessageCircle className="size-5 text-white " />
            </div>
            <h2 className="text-xl font-bold text-white">
              {showAllUser ? "New Chat" : "Messages"}
            </h2>
          </div>
          <button
            onClick={() => setShowAllUser(!showAllUser)}
            className={`p-2.5 rounded-2xl transition-colors
                 ${
                   showAllUser
                     ? " bg-red-600 hover:bg-red-700 text-white"
                     : "bg-green-600 hover:bg-green-700 text-white"
                 }`}
          >
            {showAllUser ? (
              <X className="size-5" />
            ) : (
              <Plus className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}

      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUser ? (
          <div className="space-4 h-full">
            <div className="relative">
              <Search className="absolute size-5 left-3 top-1/2 text-gray-400 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Users..."
                className="w-full pl-10 pr-2 py-3 border border-gray-700 bg-gray-800
               text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* users lists */}
            <div className="space-y-2 overflow-y-auto h-full pb-4">
              {users
                ?.filter(
                  (user) =>
                    user._id !== loggedInUser?._id &&
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLocaleLowerCase())
                )
                .map((user) => (
                  <button
                    key={user._id}
                    className="w-full text-left p-4 rounded-2xl border
                   border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors"
                    onClick={() => createChat(user)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <UserCircle2 className="size-6 text-gray-300" />
                        {/* online Symbol */}
                        {onlineUsers.includes(user._id) && (
                          <span
                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                           bg-green-500 border-2 border-gray-900 animate-spin"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {onlineUsers.includes(user?._id) ? (
                            <p className="font-semibold text-blue-600">
                              Online
                            </p>
                          ) : (
                            "Offline"
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-2 overflow-y-auto h-full pb-4 ">
            {chats.map((chat) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSentByMe = latestMessage?.sender === loggedInUser?._id;
              const unSeenCount = chat.chat.unSeenCount || 0;

            
              

              return (
                <button
                  key={chat.chat._id}
                  onClick={() => {
                    setSelectedUser(chat.chat._id), setShowSidebar(false);
                  }}
                  className={
                    isSelected
                      ? "bg-blue-600 border border-blue-500 rounded-2xl w-full p-2"
                      : "border p-2 w-full bg-gray-900 border-gray-700 rounded-2xl"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="size-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserCircle className="size-7 text-gray-300" />
                        {/* onile symbol */}
                      </div>
                      {onlineUsers.includes(chat.user._id) && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                           bg-green-500 border-2 border-gray-900 animate-spin"
                        />
                      )}
                        
                    </div>

                    <div className=" flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold truncate ${
                            isSelected ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {chat.user.name}
                        </span>
                        {unSeenCount > 0 && (
                          <div
                            className="bg-red-600 text-white text-xs font-bold rounded-full 
                                min-w-[22px] h-5.5 flex items-center justify-center px-2"
                          >
                            {unSeenCount > 299 ? "300+" : unSeenCount}
                          </div>
                        )}
                      </div>
                      {latestMessage && (
                        <div className="flex items-center gap-2">
                          {isSentByMe ? (
                            <CornerDownLeft
                              size={14}
                              className="text-blue-400 text-shrink-0"
                            />
                          ) : (
                            <CornerDownRight
                              size={14}
                              className="text-green-400 text-shrink-0"
                            />
                          )}
                          <span className="text-sm truncate text-gray-400 ">
                            {latestMessage.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4 ">
              <MessageCircle className="size-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">No Conversation yet</p>
            <p className="text-sm text-gray-500 mt-1">Start a new chat</p>
          </div>
        )}
      </div>
      {/* footer */}

      <footer className="p-4 border-t border-gray-700 space-y-2">
        <Link
          href={"/profile"}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-gray-800 transition-colors"
        >
          <div className="p-1.5 bg-gray-700 rounded-2xl">
            <UserCircle className="size-8  text-gray-400" />
          </div>
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-700 hover:bg-red-800 transition-colors"
        >
          <div className="p-1.5 bg-gray-700 rounded-2xl">
            <LogOut className="size-4  text-red-500" />
          </div>
          <span className="font-semibold">Log Out</span>
        </button>
      </footer>
    </aside>
  );
}
