const chatModel = require("../Models/chatModel");
const userModel = require("../Models/userModel");
const Teacher = require("../Models/teacherModel");
const Student = require("../Models/studentModel");
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET; // Make sure you have this key set in your environment variables
require('dotenv').config();

// create chat
// const createChat = async (req, res) => {
//     const { studentId, teacherId } = req.body;

//     try {
//         const chat = await chatModel.findOne({
//             members: { $all: [studentId, teacherId] },
//         });

//         if (chat) {
//             return res.status(200).json(chat);
//         }

//         const newChat = new chatModel({
//             members: [studentId, teacherId]
//         });

//         const response = await newChat.save();
//         res.status(200).json(response);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json(error);
//     }
// };
const createChat = async (req, res) => {
  const {  roleRef, id } = req.body; // รับค่าจาก request body

//   console.log('email:', email);
  console.log('roleRef:', roleRef);
  console.log('id:', id);

  try {
      const userId = id; // ใช้ id จาก body หรือจากข้อมูลที่ได้รับ

      // ตรวจสอบว่า userId ถูกต้องหรือไม่
      if (!userId) {
          return res.status(400).json({ message: "User ID not found" });
      }

      // สำหรับ student, สร้างแชทกับ teachers เท่านั้น
      if (roleRef === 'Student') {
          const teachers = await userModel.find({ roleRef: 'Teacher' });

          if (!teachers.length) {
              return res.status(404).json({ message: "No teachers found" });
          }

          // ตรวจสอบและสร้างแชทเฉพาะที่ยังไม่มีอยู่
          const chatPromises = teachers.map(async (teacher) => {
              if (teacher._id.toString() === userId.toString()) {
                  return null; // ไม่ต้องสร้างแชทให้กับตัวเอง
              }

              // ตรวจสอบว่าแชทระหว่าง student กับ teacher นี้มีอยู่แล้วหรือไม่
              const existingChat = await chatModel.findOne({
                  members: { $all: [userId, teacher._id] },
              });

              if (existingChat) {
                console.log(`Chat already exists: ${userId} - ${teacher._id}`);
                return res.status(200).json({ message: "Chat already exists for student" });
            }
            
            

              // ถ้าไม่มีแชทที่เหมือนกันก็สร้างแชทใหม่
              const newChat = new chatModel({
                  members: [userId, teacher._id],
              });

              return await newChat.save();
          });

          // รอให้ทุก `Promise` ทำงานเสร็จ และกรอง `null` ออก
          const chats = (await Promise.all(chatPromises)).filter(Boolean);

          console.log("Chats created:", chats);

          return res.status(200).json({
              message: chats.length > 0 ? "Chats created successfully" : "No new chats created",
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
