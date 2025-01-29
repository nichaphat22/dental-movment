const notificationChatModel = require('../Models/notificationChatModel'); // เรียกใช้โมเดล
// const messageModel = require('../Models/messageModel'); // โมเดลของข้อความ

// const createNotification = async (req, res) => {
//     const { chatId, senderId, recipientId, messageId } = req.body;

//     if (!chatId || !senderId || !recipientId || !messageId) {
//         return res.status(400).json({ message: "chatId, senderId, recipientId, and messageId are required." });
//     }

//     try {
//         // Create notification for recipient
//         const notification = new notificationChatModel({
//             userId: recipientId,
//             relatedMessageId: messageId, // Use the messageId passed in the request body
//             content: `${senderId} sent you a new message`,
//             isRead: false,
//         });

//         await notification.save();

//         res.status(200).json({
//             message: "Notification created successfully",
//             notification,
//         });
//     } catch (error) {
//         console.error("Error creating notification:", error);
//         res.status(500).json({
//             message: "Error creating notification",
//             error,
//         });
//     }
// };



// ฟังก์ชันรีเฟรชการแจ้งเตือนให้เป็น 0
// ฟังก์ชันรีเซ็ตการแจ้งเตือนให้เป็น 0
const resetNotifications = async (req, res) => {
    const { senderId } = req.params;  // รับ userId จาก params

    if (!senderId) {
        return res.status(400).json({ message: "senderId is required" });
    }

    try {
        // รีเฟรชการแจ้งเตือนทั้งหมดที่ยังไม่ได้อ่านให้เป็น read
        await notificationChatModel.updateMany(
            { senderId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            message: "Notifications reset successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error resetting notifications",
            error,
        });
    }
};


// ฟังก์ชันดึงการแจ้งเตือนทั้งหมดของผู้ใช้
const getNotifications = async (req, res) => {
    const { senderId } = req.params;

    try {
        const notifications = await notificationChatModel.find({ senderId })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching notifications",
            error,
        });
    }
};

// ฟังก์ชันดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
const getUnreadNotifications = async (req, res) => {
    const { senderId } = req.params;

    try {
        const unreadNotifications = await notificationChatModel.find({
            senderId,
            isRead: false,
        })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({
            message: "Unread notifications fetched successfully",
            unreadNotifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching unread notifications",
            error,
        });
    }
};

module.exports = {resetNotifications, getNotifications, getUnreadNotifications
};
