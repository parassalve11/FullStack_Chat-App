import { Router } from "express";
import { getAllUser, getAUser, getUserProfile, loginUser, upadteName, verifyUser } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";



const router = Router();

router.post('/login',loginUser);
router.post('/verify',verifyUser);
router.get('/me',isAuth,getUserProfile);
router.post('/update/user',isAuth,upadteName);
router.get('/user/all',getAllUser);
router.get('/user/:id',getAUser);

export default router;