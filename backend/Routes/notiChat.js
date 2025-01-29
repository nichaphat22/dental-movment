const express = require("express");
const { resetNotifications, getNotifications, getUnreadNotifications
} = require("../Controllers/notiChatController"); // เรียกใช้ฟังก์ชันจาก Controller
const router = express.Router();

// สร้างการแจ้งเตือนใหม่
// router.post('/create-notification', createNotification);

// รีเซ็ทการแจ้งเตือนให้เป็นอ่านแล้ว
router.post('/reset-notifications/:userId', resetNotifications);

// ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
router.get('/notifications/:userId', getNotifications);

// ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
router.get('/notifications/unread/:userId', getUnreadNotifications);

module.exports = router;
