import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";



interface IUser extends Document{
    _id:string,
    name:string,
    email:string
};


export interface AuthenticatedRequest extends Request{
    user?:IUser | null
};



export const isAuth = async(req:AuthenticatedRequest,res:Response , next:NextFunction):Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({message:"Please Login no Authorization token"});
            return
        };

        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(token , process.env.JWT_SECRET as string) as JwtPayload;

        if(!decodedToken || !decodedToken.user){
            res.status(404).json({message:"Token is not found"});
            return;
        };

        req.user = decodedToken.user;

        next();
    } catch (error) {
         res.status(401).json({message:"Please Login - JWT error"});
    }
}