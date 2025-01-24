const { Server } = require("socket.io");

const io = new Server(8800, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  // Adding new user
  socket.on("addNewUser", (userId) => {
    if (!onlineUsers.some((user) => user.userId === userId)) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    }

    console.log("onlineUsers", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers); // Broadcast online users to everyone
  });

  // Sending message
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId);

    if (user) {
      io.to(user.socketId).emit("getMessage", message); 
      io.to(user.socketId).emit("getNotification", { 
        senderId: message.senderId,
        isRead: false,
        date: new Date()
      });
    }
  });

  // Disconnection
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    io.emit("getOnlineUsers", onlineUsers);
    console.log("User disconnected", socket.id);
  });
});
