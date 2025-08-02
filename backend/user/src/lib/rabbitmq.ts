
import amqp from 'amqplib';

let channel : amqp.Channel;

export const connRabbitMQ= async() =>{
try {
    const conn = await amqp.connect({
        protocol:"amqp",
        hostname:process.env.RABBITMQ_HOST,
        port:5672,
        username:process.env.RABBITMQ_USERNAME,
        password:process.env.RABBITMQ_PASSWORD
    });

    channel = await conn.createChannel();

    console.log("🐇 RabbitMQ is connected ");
    
} catch (error) {
    console.log("Error while connecting RabbitMQ",error);
    process.exit(1)
    
}
};


export const publishToQueue = async(queueName:string , message:any) => {

    if(!channel){
        console.log("the Channel is not intialized in RabbitMQ.");
        return
    };


    await channel.assertQueue(queueName,{durable:true});

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),{
        persistent:true
    });
}