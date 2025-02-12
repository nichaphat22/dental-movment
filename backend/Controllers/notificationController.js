const Notification = require("../Models/notificationModel");
const quiz = require("../Models/quiz");
const mongoose = require("mongoose");

//ดึงแจ้งเตือนทั้งหมด
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//เพิ่มแจ้งเตือนใหม่
exports.createNotification = async (req, res) => {
  try {
    const { message, type, link } = req.body;

    if (!message || !type) {
      return res.status(400).json({ error: "Message and type are required" });
    }

    const newNotification = new Notification(req.body);
    await newNotification.save();

    //แจ้งเตือนทาง webSocket
    req.io.emit("newNotification", newNotification);

    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//อัปเดตการแจ้งเตือนเมื่อมีแบบทดสอบใหม่
exports.notificationQuizUpdate = async (quizTitle, quizId) => {
    try {
        const message = `มีแบบทดสอบใหม่ซ ${quizTitle}`;
        const newNotification = new Notification({
            message,
            type: "quiz_add",
            link:`/quiz/${quizId}`,
            isRead: false
        });

        await newNotification.save();

        req.io.emit("newNotification", newNotification);
    } catch (error) {
        console.error("Error sending quiz notification:", error)
    }
}
// ทำเครื่องหมายว่าอ่านแล้ว
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//ลบแจ้งเตือน
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
