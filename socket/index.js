const { Server } = require("socket.io");
const io = new Server(8800, {
  cors: {
    origin: "http://localhost:5173",  // เปลี่ยน URL ตามที่คุณใช้งาน
  },
});

const socketMap = new Map();

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  // เมื่อผู้ใช้เชื่อมต่อและส่ง userId มา
  socket.on("addNewUser", (userId) => {
    if (!userId) {
      console.log("Received undefined userId, ignoring...");
      return;
    }
    
    socketMap.set(userId, socket.id);
    console.log(`✅ User added: ${userId} -> ${socket.id}`);
    console.log("📌 Current socket map:", Array.from(socketMap.entries())); // log ค่าทั้งหมด
  });
  

socket.on("sendMessage", (message, recipientId) => {
  // ตรวจสอบว่า chatId ถูกต้องหรือไม่
  if (!message.chatId) {
    console.log("Error: message.chatId is undefined or invalid");
    return; // ไม่ทำงานถ้าไม่มี chatId
  }

  console.log("message.chatId:", message.chatId);

  // ดึง recipientSocketId จาก socketMap
  const recipientSocketId = socketMap.get(message.recipientId);
  console.log("message.recipientId", message.recipientId);
  console.log("recipientSocketId", recipientSocketId);
  // ✅ ถ้า recipientId เป็นค่าที่ไม่ต้องการให้ return ออกไป
  if (message.recipientId === "USER_ID_TO_IGNORE") {
    console.log("Skipping recipient:", message.recipientId);
    return;
  }

  if (recipientSocketId) {
    console.log("Sending message to recipient socket:", recipientSocketId);
    
    // ส่งข้อความไปยังผู้รับ
    io.to(recipientSocketId).emit("getMessage", message);
    
    // ส่ง Notification ไปยังผู้รับ
    io.to(recipientSocketId).emit("getNotification", {
      _id: message._id, 
      chatId: message.chatId,
      senderId: message.senderId,
      recipientId: message.recipientId,
      relatedMessageId: message._id, 
      isRead: false,
      date: new Date(),
    });
  } else {
    console.log("Recipient not connected:", message.recipientId);
  }
});

  // ✅ รับ event "markAsRead" จาก client และแจ้งผู้ส่งว่าถูกอ่านแล้ว
socket.on("markAsRead", ({ senderId }) => {
  console.log(`📨 Notifications read for sender: ${senderId}`);

  const senderSocketId = socketMap.get(senderId);
  if (senderSocketId) {
      io.to(senderSocketId).emit("notificationRead", { senderId });
  }
});

  // เมื่อผู้ใช้ disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of socketMap.entries()) {
      if (socketId === socket.id) {
        socketMap.delete(userId);  // ลบข้อมูล userId เมื่อผู้ใช้ตัดการเชื่อมต่อ
        break;
      }
    }
    console.log("User disconnected", socket.id);
    console.log("Updated socket map:", Array.from(socketMap.entries()));
  });
});
