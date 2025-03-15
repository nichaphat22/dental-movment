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
// const notiRoute = require("./Routes/notiChat")
// const bookmarkRoute = require("./Routes/bookmarkRoute")
const notificationRoute = require("./Routes/notificationRoute");
const authRoute = require("./Routes/authRoute");
const recentRout = require("./Routes/recentData");

const http = require("http");
const { Server } = require("socket.io");

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK:", process.env.GOOGLE_CALLBACK);

const socketMap = new Map(); // Declare socketMap as a Map
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// app.use(express.json());


// cors
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors(corsOptions)); // ใช้ CORS สำหรับ HTTP requests 

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log("Server running on port", port);
});


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  transports: ['websocket', 'polling'], // เผื่อว่ามีปัญหากับ WebSocket
});


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

app.use(passport.initialize());
app.use(passport.session());

// เพิ่ม Header สำหรับทุกเส้นทาง
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

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

app.set("socketio", io);

// MongoDB Connection
mongoose.connect(process.env.DBURI)
  .then(() => console.log("MongoDB connection established"))
  .catch(error => console.log("MongoDB connection failed:", error.message));

// Socket.io
io.on("connection", (socket) => {
  console.log("🔍 Query parameters:", socket.handshake.query);
  const token = socket.handshake.query.token; 
  console.log("New connection", socket.id);

  console.log("🔍 Verifying token:", token);  // ตรวจสอบ token ที่รับมาจาก client

  if (!token) {
    console.log("❌ Token is not provided.");
    socket.disconnect();  // ถ้าไม่มี token ให้ตัดการเชื่อมต่อ
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ Invalid token");
      socket.disconnect();  // ถ้า token ไม่ถูกต้อง ให้ตัดการเชื่อมต่อ
    } else {
      console.log("✅ User authenticated:", user);
      socket.user = user;  // เก็บข้อมูล user ลงใน socket สำหรับใช้งานต่อ
    }
  })
  

  socket.on("addNewUser", ({ userId }) => {
    if (!userId) return console.log("Received undefined userId, ignoring...");

    socketMap.set(userId, socket.id);
    socket.userId = userId;
    console.log(`✅ User added: ${userId} -> ${socket.id}`);
    console.log("📌 Current socket map:", Array.from(socketMap.entries()));
  });

  socket.on("sendMessage", (message) => {
    if (!message.chatId || !message.senderId || !message.recipientId) {
      return console.log("Error: Invalid message data", message);
    }

    const recipientSocketId = socketMap.get(message.recipientId);
    console.log(`📩 Message from ${message.senderId} to ${message.recipientId}`);

    if (recipientSocketId) {
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

  socket.on("newNotification", (data) => {
    console.log("New notification:", data);
    io.emit("newNotification", data);
  })

  socket.on("disconnect", () => {
    if (socket.userId) {
      socketMap.delete(socket.userId);
      console.log(`❌ User disconnected: ${socket.userId}`);
    }
    console.log("Updated socket map:", Array.from(socketMap.entries()));
  });
});