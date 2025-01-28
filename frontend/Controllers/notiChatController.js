const notificationChatModel = require('../Models/notificationChatModel'); // เรียกใช้โมเดล

const createNotification = async (req, res) => {
    try {
        const { userId, type, relatedMessageId, content } = req.body;

        // Create the new notification
        const newNotification = await notificationChatModel.create({
            userId,
            type,
            relatedMessageId,
            content,
            isRead: false,
        });

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: newNotification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating notification",
            error: error.message,
        });
    }
};

// ดึงการแจ้งเตือนของผู้ใช้สำหรับแชทที่เลือก
const getUserNotifications = async (req, res) => {
    try {
        const { userId, chatId } = req.params;

        // ดึงข้อมูลการแจ้งเตือนที่ยังไม่อ่านของผู้ใช้สำหรับแชทที่เลือก
        const notifications = await notificationChatModel
            .find({ userId, chatId, isRead: false }) // เฉพาะการแจ้งเตือนที่ยังไม่ได้อ่าน
            .sort({ createdAt: -1 }); // เรียงลำดับจากใหม่ไปเก่า

        res.status(200).json({
            success: true,
            message: "User notifications fetched successfully",
            data: notifications,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching notifications",
            error: error.message,
        });
    }
};

// อัปเดตสถานะการอ่านการแจ้งเตือน
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        // อัปเดตสถานะ isRead เป็น true
        const updatedNotification = await notificationChatModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true } // ส่งคืนข้อมูลที่อัปเดต
        );

        if (!updatedNotification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: updatedNotification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating notification",
            error: error.message,
        });
    }
};

// ลบการแจ้งเตือน
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        // ลบการแจ้งเตือน
        const deletedNotification = await notificationChatModel.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting notification",
            error: error.message,
        });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
};
