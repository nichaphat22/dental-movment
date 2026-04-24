const chatModel = require("../Models/chatModel");
const userModel = require("../Models/userModel");
const Teacher = require("../Models/teacherModel");
const Student = require("../Models/studentModel");
const jwt = require('jsonwebtoken');

const secret = process.env.SESSION_SECRET
require('dotenv').config();


const createChat = async (req, res) => {
  const { roleRef, id } = req.body;

  try {
    const userId = id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }

    if (roleRef === 'Student') {
      const teachers = await userModel.find({ roleRef: 'Teacher' });

      if (!teachers.length) {
        return res.status(404).json({ message: "No teachers found" });
      }

      const chatPromises = teachers.map(async (teacher) => {
        if (teacher._id.toString() === userId.toString()) {
          return null;
        }

        const existingChat = await chatModel.findOne({
          members: { $all: [userId, teacher._id] },
        });

        if (existingChat) {
          console.log(`Chat already exists: ${userId} - ${teacher._id}`);
          return existingChat; // ✅ แค่ return ค่า ไม่ต้อง res.json()
        }

        const newChat = new chatModel({
          members: [userId, teacher._id],
        });

        return await newChat.save();
      });

      const chats = (await Promise.all(chatPromises)).filter(Boolean);

      // ✅ ส่ง response แค่ครั้งเดียวตรงนี้
      return res.status(200).json({
        message: chats.length > 0 ? "Chats created successfully" : "Chat already exists for student",
        chats: chats,
      });
    }

    return res.status(400).json({ message: "Invalid role" });

  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ message: "Internal server error" });
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
