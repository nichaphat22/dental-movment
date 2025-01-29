const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid'); // ใช้ uuid เพื่อสร้าง _id

const io = new Server(8800, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Map เก็บ socketId ของผู้ใช้
const socketMap = new Map();

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  // บันทึก socketId ของผู้ใช้เมื่อเชื่อมต่อ
  socket.on("addNewUser", (userId) => {
    socketMap.set(userId, socket.id); // map userId กับ socketId
    console.log("Current socket map:", Array.from(socketMap.entries()));
  });

  // รับข้อความจากผู้ส่ง และส่งไปยังผู้รับ
  socket.on("sendMessage", (message) => {
    const recipientSocketId = socketMap.get( recipientId ); // หาผู้รับด้วย userId

    // message: response.message, recipientId 
    if (recipientSocketId) {
      console.log("Sending message to recipient socket:", recipientSocketId);

      // ส่งข้อความให้ผู้รับ
      io.to(recipientSocketId).emit("getMessage", message);
      // console.log('newMessage', newMessage)/

      io.to(recipientSocketId).emit("getNotification", {
        senderId: message.senderId,  // คนส่ง
        recipientId: message.recipientId,  // คนรับ
        isRead: false,
        date: new Date(),
      });
      
    } else {
      console.log("Recipient not connected:", message.recipientId);
    }
  });

  // เมื่อผู้ใช้ disconnect
  socket.on("disconnect", () => {
    // ลบ socketId ออกจาก map
    for (const [userId, socketId] of socketMap.entries()) {
      if (socketId === socket.id) {
        socketMap.delete(userId);
        break;
      }
    }
    console.log("User disconnected", socket.id);
    console.log("Updated socket map:", Array.from(socketMap.entries()));
  });
});
