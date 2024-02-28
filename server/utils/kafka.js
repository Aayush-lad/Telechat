import { Kafka } from "kafkajs";
import getPrismaInstance from "./PrismaClient.js";
import dotenv from "dotenv"
dotenv.config();

const kafka = new Kafka({
    brokers:[process.env.BROKER],
    ssl:true,
    sasl:{
        username:process.env.KAFKA_USERNAME,
        password:process.env.KAFKA_PASSWORD,
        mechanism:"plain"
    },
    connectionTimeout:100000,
    requestTimeout:400000,
    retry:{
        restartOnFailure: async()=> true,
        retries:100
    }
});



let producer = null
export async function createProducer(){

    console.log("producer is running")

    if(producer){
        return producer;
    }

    

    const _producer = kafka.producer()
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message){
    console.log("message is being produced",message)

    const producer = await createProducer();
    await producer.send({
        topic:"MESSAGES",
        messages:[
            {
                key:`message-${Date.now()}`,
                value:JSON.stringify(message)
            }
        ]
    })
    return true;
}

export async function startMessageConsumer(){
    console.log("consumer is running")
    const consumer = kafka.consumer({groupId:"default"});
    await consumer.connect().then("consumer-connected");
    await consumer.subscribe({topic:"MESSAGES",fromBeginning:true}).then("subscribed`");
    await consumer.run({
        autoCommit:true,
        eachMessage:async({message,pause})=>{
            console.log("Message recieved from kafka");
            if(!message.value) return;
            const data = JSON.parse(message.value);
            console.log("inside consmer ",data);
            if(!data){
                return;
            }

            try{

        const prisma = getPrismaInstance();
        const message = data.message;
        const from = data.from;
        const to = data.to;

        const getUser = onlineUsers.get(to);

        console.log("message : ",message.type);

        if(message.type==="text"){

        if (message && from && to) {
            const newMessage = await prisma.messages.create({
                data: {
                    message : message.message,
                    sender: { connect: { id: parseInt(from) } },
                    receiver: { connect: { id: parseInt(to) } },
                    messageStatus: getUser ? 'delivered' : 'sent'
                },
                include: {
                    sender: true,
                    receiver: true
                },
            });
        }
    }
        
        }
    catch(err){

        const { message, from, to } = data;
        if (message && from && to) {
            const prisma = getPrismaInstance();

            if(message.type!=="image" || message.type!=="audio"){
            const newMessage = await prisma.messages.create({
                data: {
                    message: message.message,
                    sender: { connect: { id: parseInt(from) } },
                    receiver: { connect: { id: parseInt(to) } },
                    messageStatus: getUser ? 'delivered' : 'sent'
                },
                include: {
                    sender: true,
                    receiver: true
                },
            });

            await commit();
            }
        }
        }

        }
    })

}
export default kafka;

