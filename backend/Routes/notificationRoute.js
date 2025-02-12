const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/notificationController");

// กำหนด middleware เพื่อให้ใช้ req.io
router.use((req, res, next) => {
    req.io = req.app.get("socketio");
    next();
});

router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;