"use client";

import { axiosIntance } from "@/lib/axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export const user_service = "http://43.204.231.232:5000/api/v1"
export const chat_service = "http://43.204.231.232:5003/api/v1";
export const chat_service2 = "http://43.204.231.232:5003"

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Chat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unSeenCount: number;
}

export interface ChatWithUserData {
  _id: string;
  user: User;
  chat: Chat;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;
  chats: ChatWithUserData[] | null;
  users: User[] | null;
  setChats: React.Dispatch<React.SetStateAction<ChatWithUserData[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");
      const { data } = await axiosIntance.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("User logged out successfully");
  }

  const [chats, setChats] = useState<ChatWithUserData[] | null>(null);

  async function fetchChats() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.get(`${chat_service}/chats/chat/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChats(data.chats);
    } catch (error) {
      console.log(error);
    }
  }

  const [users, setUsers] = useState<User[] | null>(null);
  async function fetchAllUsers() {
    try {
      const token = Cookies.get("token");

      const { data } = await axiosIntance.get(`/users/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchAllUsers();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        logoutUser,
        fetchAllUsers,
        fetchChats,
        chats,
        users,
        setChats
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
}

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw Error("useAppData Can be used within AppProvider ");
  return context;
};
