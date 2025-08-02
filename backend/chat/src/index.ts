import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/db.js";
import chatRoutes from "./routes/chat.route.js"
import cors from 'cors'
import { app,server } from "./lib/socket.js";
dotenv.config();





app.use(express.json());


app.use(cors());

app.use('/api/v1/chats',chatRoutes)

const PORT = process.env.PORT || 5000



server.listen( PORT,() =>{
    console.log("Server is running on Port" ,PORT);
    connectDb();
})