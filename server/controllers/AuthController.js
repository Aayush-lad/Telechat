import getPrismaInstance from "../utils/PrismaClient.js";

export const checkUser=async(req,res,next)=>{
    try{
        const {email}= req.body;

        

        if(!email){
            return res.json({message:"Email is required",status:false})
        }

        const prisma = getPrismaInstance();
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
            return res.json({message:"User not found",status:false})
        }

        return res.json({message:"User found",status:true,data:user})
    }
    catch(err){
        next(err);
    }
}

export const onBoardUser = async(req,res,next)=>{
    try{
        const { email,name,about,image} = req.body
        if(!email  || !name||!image) return res.send("Email Name and Profile Image are required")

        console.log(email)

        const prisma = getPrismaInstance();

        

        const user = await prisma.user.create({
            data:{
                name,
                email,
                about,
                image
        }})

        console.log(user)

    

        res.json({msg:"Success" ,status:true,user})


    }
    catch(e){
        console.log(e)
        
    }
}

export const getAllUsers = async(req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        const users = await prisma.user.findMany({

            orderBy:{name:"asc"},
            select:{
                id:true,
                name:true,
                email:true,
                image:true,
                about:true
            }
        });

        const usersGroupedByInitialLetter = {};
        

        users.forEach(user=>{
            const initialLetter = user.name.charAt(0).toUpperCase();
            if(!usersGroupedByInitialLetter[initialLetter]){
                usersGroupedByInitialLetter[initialLetter] = []
            }
            usersGroupedByInitialLetter[initialLetter].push(user)
        }
        )



        res.status(200).send({users:usersGroupedByInitialLetter})



    }
    catch(e){
        console.log(e)
    }
}

export const getUser = async(req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        const {id} = req.params;
        if(!id) return res.send("User id is required");
        const user = await prisma.user.findUnique({
            where:{
                id:parseInt(id)
            },

            select:{
                id:true,
                name:true,
                email:true,
                image:true,
                about:true
            }
        })

        res.status(200).send({user})
    }
    catch(e){
        console.log(e)
    }
}