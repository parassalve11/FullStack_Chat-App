import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import userRoutes from "./routes/user.route.js";
import { connRabbitMQ } from "./lib/rabbitmq.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("Redis is connected"))
  .catch(console.error);

const app = express();

// ✔ Correct CORS Setup
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://3.109.157.137",
      "http://3.109.157.137:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("The server is Running on ", PORT);
  connectDb();
  connRabbitMQ();
});
