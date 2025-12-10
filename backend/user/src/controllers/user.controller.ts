import { redisClient } from "../index.js";
import genarateTokens from "../lib/genarateToken.js";
import { publishToQueue } from "../lib/rabbitmq.js";
import TryCatch from "../lib/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";



export const loginUser = TryCatch(async(req,res) =>{
    const{email} = req.body;

    const rateLimitKey = `otp:ratelimit:${email}`;

    const rateLimit = await redisClient.get(rateLimitKey);

    if(rateLimit){
        res.status(429).json({message:"Wait before genarating otp again"})
        return;
    };

    const otp = Math.floor(10000  + Math.random() * 900000);
    const otpKey = `otp:${email}`

    await redisClient.set(otpKey,otp,{
        EX:300
    });
    await redisClient.set(rateLimitKey , "true" , {
        EX:60
    });

    const message = {
        to: email,
        suject:"Your Otp code",
        body:`Your Otp is ${otp} , Its valid for 5 min Only`
    };

    await publishToQueue("send-otp",message);

    res.status(200).json({message:"Otp is send Successfully"})
})



export const verifyUser = TryCatch(async(req,res) =>{
    
    const{email , otp:enteredOtp } = req.body;

    if(!email || !enteredOtp){
        console.log("Email and Otp is Requied.");
        return
    };

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if(!storedOtp || storedOtp !== enteredOtp){
        res.status(400).json({message:"Invalid or Expired Otp"})
        return;
    };

    await redisClient.del(otpKey);

    let user = await User.findOne({email});
    
    if(!user){
        const name = email.slice(0,8);
        user = await User.create({name,email})
    };


    const token = genarateTokens(user);

    res.json({
        message:"User verified Successfully",
        user,
        token
    })
});


export const getUserProfile = TryCatch(async(req:AuthenticatedRequest,res) =>{
    try {
        const user = req.user;
        res.json(user);
    } catch (error) {
        res.status(500).json({message:"Server error"});
        console.log("Error in getuserProfile controller" , error);
    }
});

export const upadteName = TryCatch(async(req:AuthenticatedRequest,res) =>{
    try {
        const userId = req.user?._id;

        const user = await User.findById(userId);

        if(!user){
            res.status(401).json({message:"User not found"});
            return
        };

        user.name = req.body.name;

        await user.save();

        const token = genarateTokens(user);

        res.json({message:"User upadted Succesfully ",user,token})

    } catch (error) {
        res.status(500).json({message:"Server error"});
        console.log("Error in updateName controller" , error);
    }
});


export const getAllUser = TryCatch(async(req:AuthenticatedRequest,res) =>{
    const users = await User.find();

    res.json(users);
});

export const getAUser = TryCatch(async(req:AuthenticatedRequest,res) =>{
    const userId = req.params.id;
    const user = await User.findById(userId);

    res.json(user);
});

