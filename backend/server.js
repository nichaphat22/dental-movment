require('dotenv').config();
const jwt = require('jsonwebtoken'); 
const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('./config/passport');

const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const animationRoute = require("./Routes/animationRoute");
const animation3DRoute = require("./Routes/animation3DRoute");
const lectureRoute = require("./Routes/lectureRoute");
const quizRoute = require("./Routes/quizRoute");

const notificationRoute = require("./Routes/notificationRoute");
const authRoute = require("./Routes/authRoute");
const recentRout = require("./Routes/recentData");

const notiRoute = require("./Routes/notiChat")
const bookmarkRoute = require("./Routes/bookmarkRoute")
const bodyParser = require('body-parser');
const http = require("http");
const { Server } = require("socket.io"); // เพิ่มการใช้งาน socket.io
const path = require("path");


// Socket Map to store userId -> socketId mapping
const socketMap = new Map(); // Declare socketMap as a Map
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// app.use(express.json());


// cors
// app.use(cors({
//   origin: ['http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(cors(corsOptions)); // ใช้ CORS สำหรับ HTTP requests 

// const port = process.env.PORT || 8080;
// const server = app.listen(port, () => {
//   console.log("Server running on port", port);
// });


// const io = new Server(server, {
//   cors: {
//     origin: "*", 
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'], // เผื่อว่ามีปัญหากับ WebSocket
// });


// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
    // cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// app.use(passport.initialize());
// app.use(passport.session());

// เพิ่ม Header สำหรับทุกเส้นทาง



// ใช้ express.json() และ cors
app.use(express.json());

const corsOptions = {
  origin: ['http://localhost:5173', 'https://itweb0867.cpkkuhost.com','http://localhost:8080','https://dental-movment-production.up.railway.app','https://dentalonlinelearning-production.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  credentials: true, // ใช้สำหรับอนุญาต cookie หรือข้อมูล session
};


// const corsOptions = {
//   origin: ['http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
//   credentials: true, // ใช้สำหรับอนุญาต cookie หรือข้อมูล session
// };



app.use(cors(corsOptions)); // ใช้ CORS สำหรับ HTTP requests 


const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log("Server running on port", port);
});

// Start server

// ตั้งค่า Socket.io หลังจากสร้าง server
// ตั้งค่า Socket.io หลังจากสร้าง server
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'], // ระบุ headers ที่อนุญาต
    credentials: true,
    pingTimeout: 10000,  // ตัดการเชื่อมต่อถ้าไม่มีการตอบกลับภายใน 10 วินาที
  pingInterval: 5000   // ส่ง ping ทุกๆ 5 วินาที
  },
  transports: ['websocket', 'polling'], // เผื่อว่ามีปัญหากับ WebSocket
});



// ให้ Express เสิร์ฟไฟล์ Frontend หลังจาก API
// app.use(express.static(path.join(__dirname, "./dist")));

//Router
app.get("/", (req, res) => {
  res.send("Welcome to the chat app API...");
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/animation", animationRoute);
app.use("/api/animation3D", animation3DRoute);
app.use("/api/lecture", lectureRoute);
// app.use("/api/notiChat", notiRoute)
// app.use("/api/bookmark", bookmarkRoute)
app.use("/api/quiz", quizRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/recent", recentRout );
app.use("/api/notiChat", notiRoute)
app.use("/api/bookmark", bookmarkRoute)

app.set("socketio", io);

// MongoDB Connection
mongoose.connect(process.env.DBURI)
  .then(() => console.log("MongoDB connection established"))
  .catch(error => console.log("MongoDB connection failed:", error.message));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./dist/index.html"));
// });

// Socket.io
// io.on("connection", (socket) => {
//   console.log("🔍 Query parameters:", socket.handshake.query);
//   const token = socket.handshake.query.token; 
//   console.log("New connection", socket.id);

// const uri = process.env.DBURI;

// mongoose.connect(uri, {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
// }).then(() => {
//     console.log("MongoDB connection established");
// }).catch((error) => {
//     console.log("MongoDB connection failed: ", error.message);
// });

    
// Create HTTP server and socket.io instance
// Create HTTP server and socket.io instance

// Initialize socket.io with CORS options


// Initialize socket.io with CORS options


//มัน error คอมเม้นไว้ก่อน

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  // ✅ เมื่อมีผู้ใช้เชื่อมต่อ ให้เก็บ userId -> socketId
  socket.on("addNewUser", ({ userId }) => {
      if (!userId) {
          console.log("Received undefined userId, ignoring...");
          return;
      }

      socketMap.set(userId, socket.id);
      socket.userId = userId; // ผูก userId กับ socket

      console.log(`✅ User added: ${userId} -> ${socket.id}`);
      console.log("📌 Current socket map:", Array.from(socketMap.entries()));
  });

  // ✅ ส่งข้อความถึงผู้รับ และเก็บค่าของผู้ส่ง
  socket.on("sendMessage", (message) => {
      if (!message.chatId || !message.senderId || !message.recipientId) {
          console.log("Error: Invalid message data", message);
          return;
      }

      // หา socket ของผู้รับ
      const recipientSocketId = socketMap.get(message.recipientId);
      const senderSocketId = socketMap.get(message.senderId); // ✅ เก็บค่า sender ไว้ด้วย

      console.log(`📩 Message from ${message.senderId} to ${message.recipientId}`);
      console.log("Sender Socket ID:", senderSocketId);
      console.log("Recipient Socket ID:", recipientSocketId);

      if (recipientSocketId) {
          // ส่งข้อความไปยังผู้รับ
          io.to(recipientSocketId).emit("getMessage", message);
          io.to(recipientSocketId).emit("getNotification", {
              _id: message._id,
              chatId: message.chatId,
              senderId: message.senderId,
              recipientId: message.recipientId,
              isRead: false,
              date: new Date(),
          });

          console.log("✅ Message sent to", recipientSocketId);
      } else {
          console.log("❌ Recipient not connected:", message.recipientId);
      }
      
  });

  socket.on("notificationRead", ({ senderId, recipientId }) => {
      console.log(`🔔 Notification read by ${recipientId} for sender ${senderId}`);
      
      // ส่งอัปเดตไปยังผู้ส่งว่าข้อความถูกอ่านแล้ว
      io.to(senderId).emit("updateNotification", { recipientId });
  });
  

  // ✅ แจ้งให้ sender รู้ว่าข้อความถูกอ่าน
  socket.on("markAsRead", ({ updatedMessages,senderId, recipientId }) => {
      console.log("✅ message", updatedMessages);
      const senderSocketId = socketMap.get(senderId);
      const recipientSocketId = socketMap.get(recipientId); // ✅ เก็บค่าของ recipient

      if (senderSocketId) {
          io.to(senderSocketId).emit("messageRead", { senderId, recipientId,updatedMessages });
          console.log(`✅ Messages from ${senderId} marked as read by ${recipientId}`);
      } else {
          console.log("❌ Sender is not connected:", senderId);
      }

      if (recipientSocketId) {
          console.log(`📌 Recipient (${recipientId}) is connected at: ${recipientSocketId}`);
      }
  });

  // ✅ เมื่อผู้ใช้ disconnect ให้ลบจาก `socketMap`
  socket.on("disconnect", () => { 
      if (socket.userId) {
          socketMap.delete(socket.userId);
          console.log(`❌ User disconnected: ${socket.userId}`);
      }
      console.log("Updated socket map:", Array.from(socketMap.entries()));
  });
});

// เสิร์ฟไฟล์ static จาก dist (frontend build)
app.use(express.static(path.join(__dirname, "dist")));

// ถ้าไม่เจอ route ของ API, fallback ให้ React จัดการ route เอง
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

