import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import userRoutes from "./routes/user.route.js";
import { connRabbitMQ } from "./lib/rabbitmq.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("Redis is connected"))
  .catch(console.error);

const app = express();

// 🔥 CORS FIX (allow deployed backend & frontend IPs)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // must be false if origin is "*"
  })
);

// 🟢 Preflight fix
app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("The server is Running on ", PORT);
  connectDb();
  connRabbitMQ();
});
