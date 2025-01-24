const messageModel = require("../Models/messageModel")

// createMessage
const createMessage = async (req, res) => {
    const { chatId, senderId, text, file } = req.body;

    const message = new messageModel({
        chatId,
        senderId,
        text,
        file,
    });

    try {
        const response = await message.save();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    };
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