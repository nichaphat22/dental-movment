const express = require("express");
const { resetNotifications, getNotifications, getUnreadNotifications
} = require("../Controllers/notiChatController"); // เรียกใช้ฟังก์ชันจาก Controller
const router = express.Router();

// สร้างการแจ้งเตือนใหม่
// router.post('/create-notification', createNotification);


// ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
router.get('/notifications/:userId', getNotifications);

// ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
module.exports = router;
