import amqp from 'amqplib';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'


dotenv.config();


export const sendOtpToConsumers = async() =>{
    try {
        const conn = await amqp.connect({
             protocol:"amqp",
        hostname:process.env.RABBITMQ_HOST,
        port:5672,
        username:process.env.RABBITMQ_USERNAME,
        password:process.env.RABBITMQ_PASSWORD
        });

        const channel = await conn.createChannel();

        const queueName = "send-otp";


        channel.assertQueue(queueName,{durable:true});

        console.log("🐇 Mail Serveice  consumers started ,listening for otp emails");

        channel.consume(queueName,async(msg) =>{
            if(msg){
                try {
                    const{to,subject,body} = JSON.parse(msg.content.toString())
                    const transporter = nodemailer.createTransport({
                        host:'smtp.gmail.com',
                        port:465,
                        auth:{
                            user:process.env.USER,
                            pass:process.env.PASSWORD
                        }
                    });

                    await transporter.sendMail({
                        from:"Chat App",
                        to,
                        subject,
                        text:body
                    });

                    console.log(`OTP mail is Sended to ${to}`);
                    channel.ack(msg);
                } catch (error) {
                     console.log("Faild send Otp",error);
                }
            }
        })
        
    } catch (error) {
        console.log("Faild to connect the rabbitMQ consumers",error);
    }
}