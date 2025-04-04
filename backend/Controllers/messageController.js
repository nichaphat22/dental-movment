const messageModel = require("../Models/messageModel")
const notificationChatModel = require('../Models/notificationChatModel'); // เรียกใช้โมเดล


const createMessage = async (req, res) => {
    const { chatId, senderId, recipientId, text, file } = req.body;

    if (!recipientId) {
        return res.status(400).json({ message: "Recipient ID is required." });
    }

    try {
        // เพิ่มข้อความใหม่
        const message = new messageModel({
            chatId,
            senderId,
            recipientId,
            text,
            file,
            isRead: false,
        });

        await message.save();

        // เพิ่ม Notification
        const notification = new notificationChatModel({
            chatId, 
            senderId,
            recipientId,
            relatedMessageId: message._id,
            isRead: false,
        });

        await notification.save();

        // เช็คจำนวนข้อความในแชทนี้
        const totalMessages = await messageModel.countDocuments({ chatId });

        // ถ้ามีข้อความมากกว่า 50 ให้ลบข้อความที่เก่าที่สุด
        if (totalMessages > 50) {
           // ค้นหาข้อความที่เก่าที่สุดในแชทนี้
  const oldestMessage = await messageModel.findOne({ chatId }).sort({ createdAt: 1 });
  if(oldestMessage) {
    await messageModel.deleteOne({ _id: oldestMessage._id });
  }
}

        res.status(201).json({ message: "Message created and notification sent.", message, notification });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while creating the message and notification.", error });
    }
};


const markMessageAsRead = async (req, res) => {
    const { senderId } = req.params;
  
    try {
      // ค้นหาและอัปเดตข้อความทั้งหมดที่ยังไม่ได้อ่านของ recipientId
      const result = await messageModel.updateMany(
        { senderId, isRead: false },  // กรองเฉพาะข้อความที่ยังไม่ได้อ่าน
        { $set: { isRead: true } },      // เปลี่ยนสถานะให้เป็น "อ่านแล้ว"
        // { new: true }                    // ให้คืนค่าข้อมูลที่อัปเดต
      );
      
      if (result.modifiedCount > 0) {
        // ดึงข้อมูลข้อความที่ isRead: true
        const updatedMessages = await messageModel.find({ senderId, isRead: true });

        return res.json(
            updatedMessages, // ส่งคืนเฉพาะข้อความที่ถูกอัปเดตเป็น true
        );
    }

    res.json({ success: false,message: "No messages updated." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error marking messages as read' });
    }
};


const getUnreadNotifications = async (req, res) => { 
        const { recipientId } = req.params;  // ใช้ req.params ในการรับค่า
        console.log('Recipient ID:', recipientId);  // ตรวจสอบค่า recipientId ที่ส่งมา
    
        try {
            // ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
            const notifications = await notificationChatModel.find({ 
                recipientId, 
                isRead: false  // เฉพาะการแจ้งเตือนที่ยังไม่ได้อ่าน
            }) 
                .populate("relatedMessageId") // ดึงข้อมูลข้อความที่เกี่ยวข้อง
                .sort({ createdAt: -1 }); // เรียงลำดับจากใหม่ -> เก่า
    
            res.status(200).json(notifications);  // ส่งข้อมูลกลับไป
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    

const updateNotificationsToRead = async (req, res) => { 
    const { recipientId } = req.params;  // ใช้ req.params ในการรับค่า recipientId

    try {
        // อัปเดตการแจ้งเตือนที่ยังไม่ได้อ่านให้เป็น "isRead: true"
        const updatedNotifications = await notificationChatModel.updateMany(
            { recipientId, isRead: false },  // กรองการแจ้งเตือนที่ยังไม่ได้อ่าน
            { $set: { isRead: true } }        // เปลี่ยนสถานะให้เป็น "อ่านแล้ว"
        );

        // ส่งข้อมูลการแจ้งเตือนที่ถูกอัปเดตกลับ
        res.status(200).json(updatedNotifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const notificationUserRead = async (req, res) => {
    const { senderId } = req.params;
    try {
        // ค้นหาและอัปเดตแจ้งเตือนทั้งหมดที่ยังไม่อ่านจาก recipientId
        const updatedNotifications = await notificationChatModel.updateMany(
            { senderId, isRead: false }, 
            { $set: { isRead: true } }
        );

        res.status(200).json(updatedNotifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const notificationDeleteUserRead = async (req, res) => {
    const { recipientId } = req.params;
    console.log('Deleting notifications for recipientId:', recipientId); // เพิ่มการ log ที่นี่
    try {
        const deletedNotifications = await notificationChatModel.deleteMany(
            { recipientId, isRead: true }
        );
        res.status(200).json({ message: "Deleted read notifications", deletedNotifications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

  


// getMessages
const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        // ตรวจสอบว่ามี chatId หรือไม่
        if (!chatId) {
            return res.status(400).json({ error: 'chatId is required' });
        }

        // ค้นหาข้อความในฐานข้อมูลตาม chatId
        const messages = await messageModel.find({ chatId });

        // หากไม่พบข้อความ ให้ส่งข้อความว่าไม่มีข้อความ
        if (messages.length === 0) {
            return res.status(200).json({ message: 'No messages found' });
        }

        // ส่งข้อความทั้งหมดที่พบ
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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


module.exports = {createMessage, getMessages,markMessageAsRead, getUnreadNotifications,updateNotificationsToRead,notificationUserRead,notificationDeleteUserRead};