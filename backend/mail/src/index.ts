import express from "express";
import dotenv from 'dotenv'
import { sendOtpToConsumers } from "./consumer";


dotenv.config()

const app = express();


const PORT= process.env.PORT

app.listen(PORT,() =>{
    console.log(" Mail Server is connected on ",PORT );
    sendOtpToConsumers();
})