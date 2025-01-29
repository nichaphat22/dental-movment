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
            senderId: senderId, // Use recipientId for notification
            relatedMessageId: message._id,
            content: `${senderId} sent you a new message`,
            isRead: false,
        });

        await notification.save();

        res.status(201).json({ message: "Message created and notification sent.", message, notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while creating the message and notification.", error });
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


module.exports = {createMessage, getMessages};