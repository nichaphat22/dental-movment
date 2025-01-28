const express = require("express");
const { 
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
} = require("../Controllers/notiChatController"); // เรียกใช้ฟังก์ชันจาก Controller
const router = express.Router();

// สร้างการแจ้งเตือนใหม่
router.post("/", createNotification);

// ดึงการแจ้งเตือนทั้งหมดสำหรับแชทที่กำหนด (ตาม `chatId`)
router.get("/:chatId", getUserNotifications);

// อัปเดตสถานะการแจ้งเตือนเป็น "อ่านแล้ว" (โดยใช้ `notificationId`)
router.put("/:notificationId/read", markAsRead);

// ลบการแจ้งเตือน (โดยใช้ `notificationId`)
router.delete("/:notificationId", deleteNotification);

module.exports = router;
