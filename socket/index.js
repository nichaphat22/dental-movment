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

socket.on("markAsRead", ({ senderId, recipientId }) => {
  const senderSocketId = socketMap.get(senderId);
  if (!senderSocketId) return;
  
  // ส่งกลับไปยังผู้ส่งให้ทราบว่าข้อความถูกอ่าน
  io.to(senderSocketId).emit("messageRead", { senderId, recipientId });

  console.log(`✅ Messages from ${senderId} marked as read by ${recipientId}`);
});



// socket.on("markAsRead", async ({ messageId, senderId }) => {
//   try {
//     // ✅ ค้นหา Socket ID ของผู้ส่ง
//     const senderSocketId = socketMap.get(senderId);
//     if (senderSocketId) {
//       // 🔹 แจ้งให้ผู้ส่งอัปเดต UI
//       io.to(senderSocketId).emit("messageRead", { senderId });

//       // 🔹 แจ้งเตือนว่าอ่านแล้ว (ถ้ามีการใช้ระบบ notification)
//       io.to(senderSocketId).emit("notificationRead", { senderId });
//     }
//   } catch (error) {
//     console.error("❌ Error updating message as read:", error);
//   }
// });

// socket.on("markMessageAsRead", async ({ senderId }) => {

//       // ✅ ส่ง event ให้ผู้ส่งรู้ว่าข้อความถูกอ่านแล้ว
//       io.to(senderId).emit("messageRead", { senderId });

// });





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
