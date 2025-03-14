const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const passport = require("passport")
const session = require('express-session');
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const animationRoute = require("./Routes/animationRoute");
const animation3DRoute = require("./Routes/animation3DRoute");
const lectureRoute = require("./Routes/lectureRoute");
const quizRoute = require("./Routes/quizRoute");
const notiRoute = require("./Routes/notiChat")
const bookmarkRoute = require("./Routes/bookmarkRoute")
const bodyParser = require('body-parser');
const http = require("http");
const { Server } = require("socket.io"); // เพิ่มการใช้งาน socket.io
const path = require("path");
require('dotenv').config();


// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
// console.log("GOOGLE_CALLBACK:", process.env.GOOGLE_CALLBACK);

// Socket Map to store userId -> socketId mapping
const socketMap = new Map(); // Declare socketMap as a Map
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// Express session
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//   }));

// app.use(passport.initialize());
// app.use(passport.session());



// ใช้ express.json() และ cors
app.use(express.json());

const corsOptions = {
  origin: ['http://localhost:5173', 'https://itweb0867.cpkkuhost.com','https://backend-dental-production.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  // allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  // credentials: true, // ใช้สำหรับอนุญาต cookie หรือข้อมูล session
};



app.use(cors(corsOptions)); // ใช้ CORS สำหรับ HTTP requests 

// Set up HTTP server
// const server = http.createServer(app);
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Socket.io Server is running');
// });
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
    credentials: true
  },
  transports: ['websocket', 'polling'], // เผื่อว่ามีปัญหากับ WebSocket
});


// ให้ Express เสิร์ฟไฟล์ Frontend หลังจาก API
app.use(express.static(path.join(__dirname, "./dist")));

//Router
app.get("/", (req, res) => {
  res.send("Welcome to the chat app API...");
});
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/animation", animationRoute);
app.use("/api/animation3D", animation3DRoute);
app.use("/api/lecture", lectureRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/notiChat", notiRoute)
app.use("/api/bookmark", bookmarkRoute)


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});


const uri = process.env.DBURI;

mongoose.connect(uri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connection established");
}).catch((error) => {
    console.log("MongoDB connection failed: ", error.message);
});

    
// Create HTTP server and socket.io instance
// Create HTTP server and socket.io instance

// Initialize socket.io with CORS options


// Initialize socket.io with CORS options



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
        console.log("✅ dgfdffffffffmessage", updatedMessages);
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
