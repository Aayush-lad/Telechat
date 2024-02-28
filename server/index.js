import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
import { Redis } from "ioredis";
import { produceMessage, startMessageConsumer } from "./utils/kafka.js";

dotenv.config();

let prevMessage = undefined;

const app = express();
const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://telechat-client.vercel.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//app.use("/uploads/images", express.static("uploads/images"));
//app.use("/uploads/audio",express.static("uploads/audio"))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log("Starting message consumer");
  startMessageConsumer();
  sub.subscribe("MESSAGES");
});

const io = new Server(server, {
  cors: {
    origin: "https://telechat-client.vercel.app",
    allowedHeaders: ["*"],
  },
});
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  console.log("a user connected");

  socket.on("add-user", (userId) => {
    console.log("inside add user");
    console.log(userId);
    onlineUsers.set(userId, socket.id);
    console.log(global.onlineUsers);
    socket.broadcast.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("logout", (userId) => {
    onlineUsers.delete(userId);
    socket.broadcast.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("send-msg", async (data) => {
    console.log("publishing message");

    await pub
      .publish("MESSAGES", JSON.stringify({ data }))
      .then(console.log("Message sent to redis"));



    sub.on("message", async (channel, message) => {
      console.log("message received");

      if (channel === "MESSAGES" && prevMessage !== message) {
        const data = JSON.parse(message);
        console.log(data.data);

        const sendUserSocket = onlineUsers.get(data.data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("msg-recieve", {
            message: data.data.message,
            from: data.data.from,
          });

          prevMessage = message;

          console.log("Message sent to kafka");
        }
      }
    });

    await produceMessage(data);
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        callType: data.callType,
        roomId: data.roomId,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    console.log(data);
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        callType: data.callType,
        roomId: data.roomId,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected", {
        from: data.from,
        callType: data.callType,
        roomId: data.roomId,
      });
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected", {
        from: data.from,
      });
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("call-accepted");
    }
  });
});
