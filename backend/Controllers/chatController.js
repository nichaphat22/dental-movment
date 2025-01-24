const chatModel = require("../Models/chatModel");

// create chat
const createChat = async (req, res) => {
    const { studentId, teacherId } = req.body;

    try {
        const chat = await chatModel.findOne({
            members: { $all: [studentId, teacherId] },
        });

        if (chat) {
            return res.status(200).json(chat);
        }

        const newChat = new chatModel({
            members: [studentId, teacherId]
        });

        const response = await newChat.save();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// findUserChat
const findUserChat = async (req, res) => {
    const userId = req.params.userId;

    try {
        const chats = await chatModel.find({
            members: { $in: [userId] },
        });

        res.status(200).json(chats);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// findChat
const findChat = async (req, res) => {
    const { studentId, teacherId } = req.body;

    try {
        const chat = await chatModel.findOne({
            members: { $all: [studentId, teacherId] },
        });

        res.status(200).json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = { createChat, findUserChat, findChat };
