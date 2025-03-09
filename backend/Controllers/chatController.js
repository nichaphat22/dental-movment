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
    const { email, token, roleRef } = req.body;

    if (!email || !token || !roleRef) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    try {
        // Verify the token and extract user details
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await userModel.findOne({ _id: decoded._id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = user._id;
        
        let chats = [];

        // Proceed with the rest of your chat creation logic
        // Based on the roleRef ('student' or 'teacher')
        if (roleRef === 'student') {
            const teachers = await userModel.find({ roleRef: 'teacher' });
            if (teachers.length === 0) {
                return res.status(404).json({ message: "No teachers found" });
            }

            const chatPromises = teachers.map(async (teacher) => {
                if (teacher._id.toString() === userId.toString()) {
                    return;
                }

                // Check if a chat already exists between this student and teacher
                const existingChat = await chatModel.findOne({
                    members: { $all: [userId, teacher._id] },
                });

                // If no existing chat, create a new chat
                if (!existingChat) {
                    const newChat = new chatModel({
                        members: [userId, teacher._id],
                    });
                    const savedChat = await newChat.save();
                    chats.push(savedChat);
                }
            });

            await Promise.all(chatPromises);

            // If chats were created, return the response
            if (chats.length > 0) {
                res.status(200).json({ message: "Chats created for student", chats });
            } else {
                // If no new chats were created (i.e., chat already exists), return a different message
                res.status(200).json({ message: "Chat already exists for student", chats });
            }
        } else if (roleRef === 'teacher') {
            const students = await userModel.find({ roleRef: 'student' });
            if (students.length === 0) {
                return res.status(404).json({ message: "No students found" });
            }

            const chatPromises = students.map(async (student) => {
                if (student._id.toString() === userId.toString()) {
                    return;
                }

                // Check if a chat already exists between this teacher and student
                const existingChat = await chatModel.findOne({
                    members: { $all: [student._id, userId] },
                });

                // If no existing chat, create a new chat
                if (!existingChat) {
                    const newChat = new chatModel({
                        members: [student._id, userId],
                    });
                    const savedChat = await newChat.save();
                    chats.push(savedChat);
                }
            });

            await Promise.all(chatPromises);

            // If chats were created, return the response
            if (chats.length > 0) {
                res.status(200).json({ message: "Chats created for teacher", chats });
            } else {
                // If no new chats were created (i.e., chat already exists), return a different message
                res.status(200).json({ message: "Chat already exists for teacher", chats });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating chat", error: error.message });
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
