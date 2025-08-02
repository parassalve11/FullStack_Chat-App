
import mongoose,{Document,Schema,Types} from 'mongoose';



export interface IMessage extends Document{
    chatId : Types.ObjectId,
    sender:string,
    content?:string,
    image?:{
        url:string,
        publicId:string
    },
    messageType:"text"|"image",
    seen:boolean,
    seenAt?:Date,
    createdAt:Date,
    UpdatedAt:Date
};


const messageSchema :  Schema<IMessage> = new Schema({
    chatId:{
        type:Schema.Types.ObjectId,
        ref:"Chat", 
        required:true
    },
    sender:{
        type:String,
        required:true
    },
    content:String,
    image:{
        url:String,
        publicId:String
    },
    messageType:{
        type:String,
        enum:["text" , "image"],
        default:"text"
    },
    seen:{
        type:Boolean,
        default:false
    },
    seenAt:{
        type:Date,
        default:null
    }
},{timestamps:true})



const Message = mongoose.model<IMessage>("Message",messageSchema);


export default Message;