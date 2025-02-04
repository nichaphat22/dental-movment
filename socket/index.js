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
  

  socket.on("sendMessage", (message) => {
    if (!message.chatId) {
        console.log("Error: message.chatId is undefined or invalid");
        return;
    }

    const recipientSocketId = socketMap.get(message.recipientId);
    console.log("Recipient ID:", message.recipientId);
    console.log("Recipient Socket ID:", recipientSocketId);

    if (!recipientSocketId) {
        console.log("Recipient not connected:", message.recipientId);
        return;
    }

    io.to(recipientSocketId).emit("getMessage", message);
    io.to(recipientSocketId).emit("getNotification", {
        _id: message._id, 
        chatId: message.chatId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        isRead: false,
        date: new Date(),
    });

    console.log("Message sent to", recipientSocketId);
});

  // ✅ รับ event "markAsRead" จาก client และแจ้งผู้ส่งว่าถูกอ่านแล้ว
socket.on("markAsRead", ({ senderId }) => {
  console.log(`📨 Notifications read for sender: ${senderId}`);

  const senderSocketId = socketMap.get(senderId);
  if (senderSocketId) {
      io.to(senderSocketId).emit("notificationRead", { senderId });
  }
});

socket.on("messageRead", ({ senderId, receiverId }) => {
  console.log(`Notifying sender (${senderId}) that receiver (${receiverId}) read the message`);

  // แจ้งเตือนผู้ส่งว่าข้อความถูกอ่าน
  io.to(senderId).emit("messageRead", { senderId, receiverId });
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
