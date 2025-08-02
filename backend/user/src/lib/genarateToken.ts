
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();





const genarateTokens = (user:any) =>{
    return jwt.sign({user},process.env.JWT_SECRET as string,{expiresIn:"15d"})
};


export default genarateTokens;