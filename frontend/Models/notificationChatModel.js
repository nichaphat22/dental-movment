const mongoose = require("mongoose");

const notificationChatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // User ที่ได้รับการแจ้งเตือน
            required: true,
        },
        type: {
            type: String,
            enum: ['message', 'system'], // ประเภทของแจ้งเตือน
            default: 'message',
        },
        relatedMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message', // อ้างอิงข้อความที่เกี่ยวข้อง
        },
        content: {
            type: String, // ข้อความแจ้งเตือน เช่น "You have a new message"
        },
        isRead: {
            type: Boolean,
            default: false, // ค่าเริ่มต้น: ยังไม่ได้อ่าน
        },
    },
    {
        timestamps: true,
    }
);

const notificationChatModel = mongoose.model("NotificationChat", notificationChatSchema);

module.exports =  notificationChatModel;