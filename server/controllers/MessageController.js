import getPrismaInstance from "../utils/PrismaClient.js";
import {BlobServiceClient} from  "@azure/storage-blob"
import dotenv from 'dotenv';
dotenv.config();


const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export const addMessage = async (req, res, next) => {
    try {
        const prisma = getPrismaInstance();
        const { message, from, to } = req.body;

        const getUser = onlineUsers.get(to);

        console.log(message, from, to, getUser);

     

        if (message && from && to) {
            const newMessage = await prisma.messages.create({
                data: {
                    message,
                    sender: { connect: { id: parseInt(from) } },
                    receiver: { connect: { id: parseInt(to) } },
                    messageStatus: getUser ? 'delivered' : 'sent'
                },
                include: {
                    sender: true,
                    receiver: true
                },
            });


            // delete the message to avoid duplication from kafka 

            const deleteMessage = await prisma.messages.delete({
                where: {
                    Id: newMessage.Id
                }
            })

            console.log("New Message Created", newMessage);

            

            res.status(201).send({ message: newMessage });
        } else {
            res.status(400).send({ message: "Invalid request" });
        }
    } catch (err) {
        next(err);
    }
}


export const getMessages = async (req, res, next) =>   {

    try {
        const prisma = getPrismaInstance();
        const { from, to } = req.params;
        console.log(from, to);

        if (from && to) {
            const messages = await prisma.messages.findMany({
                where: {
                    OR: [
                        {
                            senderId: parseInt(from),
                            receiverId: parseInt(to)
                        },
                        {
                            senderId: parseInt(to),
                            receiverId: parseInt(from)
                        }
                    ]
                },
                orderBy:{

                    Id:'asc'
                }
            });

            
            const unreadMessages = [];

            messages.forEach((message,index)=>{

                if(message.messageStatus !== 'read' && message.senderId === parseInt(to)){

                

                    messages[index].messageStatus = 'read'
                    unreadMessages.push(message.Id)
                }

            })

            await prisma.messages.updateMany({
                where:{
                    Id:{
                        in:unreadMessages
                    }
                },
                data:{
                    messageStatus:'read'
                }
            })

            res.status(200).json({ messages });
        }
    }
     catch(e){

        console.log(e)
            next()
        }
    }

export const addImageMessage = async (req, res, next) => {
    try{

        

        if(req.file){
            const data = Date.now();
            let filename = data + req.file.originalname;

            const containerName = "telechat"

            // storing image to azure blob storage container
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const  blockBlobClient = containerClient.getBlockBlobClient(filename)

           await blockBlobClient.uploadFile(req.file.path);

           const imageUrl = await blockBlobClient.url;

          console.log(imageUrl)
    
            const prisma = getPrismaInstance();
            const {from,to} = req.query;
            
            console.log(from,to)
            if(from && to){
            const message = await prisma.messages.create({
                data:{
                    message:imageUrl,
                    sender:{connect:{id:parseInt(from)}},
                    receiver:{connect:{id:parseInt(to)}},
                    type:"image"
                }
            })

            console.log(message)

            return res.status(201).send({message})
        }
        return res.status(400).send({message:"Invalid request"})
    }
    return res.status(400).send({message:"Invalid request"})
    }   
    catch(err){
        console.log(err)
    }         
            
}


// export const addAudioMessage = async (req, res, next) => {
//     try{

//         if(req.file){
//             const data = Date.now();
//             let filename = data + req.file.originalname;
//             const containerName = "telechat";
//             const containerClient = blobServiceClient.getContainerClient(containerName);
//             const  blockBlobClient = containerClient.getBlockBlobClient(filename)

//            await blockBlobClient.uploadFile(req.file.path);

//            const audioUrl = await blockBlobClient.url;
//             const prisma = getPrismaInstance();
//             const {from,to} = req.query;
//             if(from && to){
//                 const message = await prisma.messages.create({
//                     data:{
//                         message:audioUrl,
//                         sender:{connect:{id:parseInt(from)}},
//                         receiver:{connect:{id:parseInt(to)}},
//                         type:"audio"
//                     }
//                 })
//                 return res.status(201).send({message})
//             }
//             return res.status(400).send({message:"Invalid request"})
//         }
//         return res.status(400).send({message:"Invalid request"})
    
//     }

//     catch(err){
//         console.log(err)
//     }
// }


export const getInitialContactsWithMessage = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.from);
        console.log("userId" + userId)
        const prisma = getPrismaInstance();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                sentMessages: {
                    include: {
                        receiver: true,
                        sender: true,
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                receivedMessages: {
                    include: {
                        sender: true,
                        receiver: true,
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        const messages = [...user.sentMessages, ...user.receivedMessages];
        messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const users = new Map();
        const messageStatusChange = [];

        messages.forEach((msg) => {
            const isSender = msg.senderId === userId;
            let contactId = isSender ? msg.receiverId : msg.senderId;

            if (msg.messageStatus === "sent") {

            
                messageStatusChange.push(msg.Id);
            }

            const { id, type, message, messageStatus, createdAt, senderId, receiverId } = msg;
            let user = {
                messageId: id,
                type,
                message,
                createdAt,
                senderId,
                receiverId
            };

            if (!users.get(contactId)) {
             

                if (isSender) {
                    user = {
                        ...user,
                        ...msg.receiver,
                        totalUnreadMessages: 0,
                    };
                } else {
                    user = {
                        ...user,
                        ...msg.sender,
                        totalUnreadMessages: messageStatus !== "read" ? 1 : 0
                    };
                }

                users.set(contactId, { ...user });
            } else if (messageStatus !== 'read' && !isSender) {
                const user = users.get(contactId);
                users.set(contactId, {
                    ...user,
                    totalUnreadMessages: user.totalUnreadMessages + 1
                });
            }
        });

        console.log(messageStatusChange.length);

        if (messageStatusChange && messageStatusChange.length > 0) {
            await prisma.messages.updateMany({
                where: {
                    Id: {
                        in: messageStatusChange
                    }
                },
                data: {
                    messageStatus: 'delivered'
                }
            });
        }

        return res.status(200).json({
            users: Array.from(users.values()),
            onlineUsers: Array.from(onlineUsers.keys())
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const searchMessages = async(req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        let {from,to,search,image,audio,message} = req.params;
        let messages= []
        console.log(from,to,search,image,audio,message)
        if(from=="none") from = null;
        if(to=="none") to = null;

        if(from ){
            messages = await prisma.messages.findMany({
                where:{
                    OR:[
                        {
                            senderId:parseInt(from),
                            
                        },
                        {
                            
                            receiverId:parseInt(from)
                        }
                    ],
                }
            })

        }
    

        if(search.length >0){
            message=true
        }

        console.log(image,audio,message,search)

    
        let responseMessages = [];
            for(let i = 0; i < messages.length; i++){
                const msg = messages[i];
                console.log(typeof audio)
                if(image=="true" ){

                    console.log(image , msg.type)
                    if(msg.type === 'image')
                    responseMessages.push(msg);
                }
                
                if(message==true&& msg.type === 'text'&& msg.message.includes(search) && !msg.message.startsWith("http://")){

                    console.log(search,msg.message,msg.message.includes(search));
                
                    responseMessages.push(msg);
                }
            }
            return res.status(200).send({responseMessages})
    }
    catch(e){
        console.log(e)
        return res.status(500).send({error:"Internal server error"})
    }
}
