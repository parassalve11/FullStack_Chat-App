"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers:string[]
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers:[]
});

import React from "react";
import { chat_service2, useAppData } from "./appContext";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const[onlineUsers , setOnlineUser] = useState<string[]>([]);
  const { user } = useAppData();

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(chat_service2,{
        query:{
            userId:user?._id
        }
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers" ,(users:string[]) =>{
        setOnlineUser(users)
    })

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);
  return (
    <SocketContext.Provider value={{ socket , onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = () => useContext(SocketContext);
