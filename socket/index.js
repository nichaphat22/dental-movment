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
    socketMap.set(userId, socket.id); // เก็บ userId กับ socketId
    console.log("Current socket map:", Array.from(socketMap.entries()));
  });

  // รับข้อความจากผู้ส่งและส่งให้ผู้รับ
  socket.on("sendMessage", (message, userId) => {
    if (message.senderId === userId) return; // ไม่ส่งข้อความให้ผู้ส่งเอง

    const recipientSocketId = socketMap.get(message.recipientId);
    if (recipientSocketId) {
      console.log("Sending message to recipient socket:", recipientSocketId);
      // Send the notification with the full data
      io.to(recipientSocketId).emit("getNotification", {
        _id: message._id, // Include message ID for proper notification tracking
        chatId: message.chatId,
        recipientId: message.recipientId,
        relatedMessageId: message._id, // Using message._id directly, not message.message._id
        // content: `${senderId} sent you a new message`, // Display sender's name dynamically
        isRead: false,
        date: new Date(),
      });
    } else {
      console.log("Recipient not connected:", message.recipientId);
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
