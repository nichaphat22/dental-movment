const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware")
// Middleware สำหรับแนบ `socket.io` ไปที่ `req.io`
router.use((req, res, next) => {
  const io = req.app.get("socketio");
  console.log("✅ WebSocket Instance:", io);
  if (!io) {
    console.error("⚠️ WebSocket connection not initialized");
    return res.status(500).json({ error: "WebSocket connection not initialized" });
  }
  req.io = io;
  next();
});



// 📌 API ดึงแจ้งเตือนของผู้ใช้ที่ล็อกอิน
router.get("/user",verifyToken, notificationController.getUserNotifications);

// 📌 API อัปเดตสถานะแจ้งเตือนเป็น "อ่านแล้ว"
router.put("/mark-read", notificationController.markAsRead);

// 📌 API ลบแจ้งเตือน;
router.delete("/:notificationId", notificationController.deleteNotification);

// 📌 ลบแจ้งเตือนที่เกี่ยวข้องกับ User
router.delete("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await notificationController.deleteUserNotifications(userId);
    res.json({ message: "ลบแจ้งเตือนของผู้ใช้เรียบร้อย" });
  } catch (error) {
    console.error("❌ Error deleting user notifications:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแจ้งเตือน" });
  }
});

// 📌 ลบแจ้งเตือนที่เกี่ยวข้องกับ Quiz
router.delete("/quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    await notificationController.deleteQuizNotifications(quizId);
    res.json({ message: "ลบแจ้งเตือนที่เกี่ยวข้องกับ Quiz เรียบร้อย" });
  } catch (error) {
    console.error("❌ Error deleting quiz notifications:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแจ้งเตือนที่เกี่ยวข้องกับ Quiz" });
  }
});

module.exports = router;
