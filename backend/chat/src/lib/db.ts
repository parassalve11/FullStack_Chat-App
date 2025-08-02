import mongoose from "mongoose";



export const connectDb = async() =>{
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URl}`);
        console.log(" 📅 MongoDb is connected on host ",conn.connection.host );    
    } catch (error) {
        console.log("Error while connecting MongoDb" , error);
        process.exit(1);
    }
};



