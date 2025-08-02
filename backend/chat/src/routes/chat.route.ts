import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import {
  createNewChat,
  getAllChats,
  getMessageByChat,
  sendMessage,
} from "../controllers/chat.controller.js";
import { upload } from "../lib/multer.js";

const router = Router();

router.post("/new", isAuth, createNewChat);
router.get("/chat/all", isAuth, getAllChats);
router.post("/message", isAuth, upload.single("image"), sendMessage);
router.get("/message/:chatId" , isAuth ,getMessageByChat) 

export default router;
