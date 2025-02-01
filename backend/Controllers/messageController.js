const messageModel = require("../Models/messageModel")
const notificationChatModel = require('../Models/notificationChatModel'); // เรียกใช้โมเดล


const createMessage = async (req, res) => {
    const { chatId, senderId, recipientId, text, file } = req.body;

    if (!recipientId) {
        return res.status(400).json({ message: "Recipient ID is required." });
    }

    try {
        // Create the message
        const message = new messageModel({
            chatId,
            senderId,
            recipientId, // Use recipientId directly
            text,
            file,
        });

        // Save the message to the database
        await message.save();

        // Create a notification for the recipient user
        const notification = new notificationChatModel({
            // senderId: senderId, 
            recipientId: recipientId,
            relatedMessageId: message._id,
            content: `${senderId} sent you a new message`, // เปลี่ยนข้อความนี้ให้แสดงชื่อผู้ส่งได้ดียิ่งขึ้น
            isRead: false,
        });
        
        await notification.save();

        res.status(201).json({ message: "Message created and notification sent.", message, notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while creating the message and notification.", error });
    }
};

const getUnreadNotifications = async (req, res) => { 
    const { recipientId } = req.params;  // ถ้าค่า recipientId ถูกส่งใน URL parameter
    console.log('Recipient ID:', recipientId);  // ตรวจสอบว่า recipientId มาถูกต้องหรือไม่
   
    try {
        // ค้นหาการแจ้งเตือนที่ยังไม่ได้อ่านสำหรับ recipientId
        const unreadNotifications = await notificationChatModel.find({
            recipientId: recipientId,
            isRead: false,
        }).lean();  // ใช้ lean() หลัง find()
        // ส่งข้อมูลการแจ้งเตือนที่ยังไม่ได้อ่านกลับไป
        res.json(unreadNotifications);
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        res.status(500).json({ error: 'Failed to fetch unread notifications' });
    }
};
const updateNotificationsToRead = async (req, res) => {
    const { recipientId } = req.params;  // ใช้ req.body แทน req.params
    console.log('Recipient ID:', recipientId);  // ตรวจสอบค่า recipientId ที่ส่งมา

    try {
        // ค้นหาการแจ้งเตือนที่ยังไม่ได้อ่านสำหรับ recipientId
        const notifications = await notificationChatModel.updateMany(
            { recipientId: recipientId, isRead: false },  // ตรวจสอบว่าเป็นของ recipientId และยังไม่ได้อ่าน
            { $set: { isRead: true } }  // อัปเดตสถานะเป็น read
        );

        if (notifications.nModified > 0) {  // ตรวจสอบว่าอัปเดตแล้วกี่รายการ
            return res.status(200).json({ success: true, message: "Notifications marked as read" });
        } else {
            return res.status(404).json({ success: false, message: "No unread notifications found" });
        }
    } catch (error) {
        console.error("Error updating notifications:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// getMessages
const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await messageModel.find({ chatId });
        res.status(200).json(messages);
    }catch (error) {
        console.log(error);
        res.status(500).json(error);
    };
};

// const getMessages = async (req, res) => {
//     const { chatId } = req.params;

//     console.log(`Fetching messages for chatId: ${chatId}`);

//     try {
//         const messages = await messageModel.find({ chatId }).exec();
//         console.log(`Messages found: ${messages.length}`);

//         if (messages.length === 0) {
//             return res.status(200).json({ message: "No messages found.", messages: [] });
//         }

//         res.status(200).json(messages);
//     } catch (error) {
//         console.log(`Error fetching messages: ${error.message}`);
//         res.status(500).json({ message: "An error occurred while fetching messages.", error });
//     }
// };


module.exports = {createMessage, getMessages, getUnreadNotifications,updateNotificationsToRead};