const { Server } = require("socket.io");
const io = new Server(8800, {
  cors: {
    origin: "http://localhost:5173",  // เปลี่ยน URL ตามที่คุณใช้งาน
  },
});

// ใช้ Map เพื่อเก็บ userId -> socketId ของทั้ง sender และ recipient
const socketMap = new Map();


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
