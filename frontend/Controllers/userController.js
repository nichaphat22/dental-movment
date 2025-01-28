const userModel = require("../Models/userModel");
const Teacher = require("../Models/teacherModel");
const Student = require("../Models/studentModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
// const { oauth2client } = require("../utils/googleConfig");
// const axios = require('axios');

// const { OAuth2Client } = require('google-auth-library')
// const oauth2client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

// register
// // register
// const registerUser = async (req, res) => {
//     try {
//         const { fname, lname, email, password, role, img } = req.body;

//         let user = await userModel.findOne({ email });

//         if (user) return res.status(400).json("User with the given email already exists...");

//         if (!fname || !lname || !email || !password || !role || !img) return res.status(400).json("All fields are required...");

//         if (!validator.isEmail(email)) return res.status(400).json("Email must be a valid email...");

//         user = new userModel({ fname, lname, email, password, role,img });

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(user.password, salt);

//         // Save the user
//         await user.save();

//         // Check if the role is 'student' and create student record
//         if (role === 'student') {
//             const student = await Student.create({ user: user._id });
//             user.student = student._id;
//             await user.save();
//         } else if (role === 'teacher') {
//             const teacher = await Teacher.create({ user: user._id });
//             user.teacher = teacher._id;
//             await user.save();
//         }

//         const token = createToken(user._id);

//         res.status(200).json({ _id: user._id, fname, lname, email, role, img, token });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json(error);
//     }
// };


// login
const loginUser = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await userModel.findOne({ email });

        if (!user) return res.status(400).json("Invalid email or password...");

        // const isValidPassword = await bcrypt.compare(password, user.password);

        // if (!isValidPassword) return res.status(400).json("Invalid email or password...");

        const token = createToken(user._id);

        res.status(200).json({ _id: user._id, name: user.name, email, role: user.role, img: user.img, token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};



// Add teacher
const addTeacher = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json("User not found...");

        const teacher = await Teacher.create({ user: userId }); // สร้างข้อมูลใน teacherModel
        user.teacher = teacher._id; // อัปเดตฟิลด์ teacher ใน userModel

        await user.save();

        res.status(200).json({ message: "Teacher added successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Add student
const addStudent = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json("User not found...");

        const student = await Student.create({ user: userId }); // สร้างข้อมูลใน studentModel
        user.student = student._id; // อัปเดตฟิลด์ student ใน userModel

        await user.save();

        res.status(200).json({ message: "Student added successfully", user });
    } catch (error) {
        console. log(error);
        res.status(500).json(error);
    }
};

// finduser
const findUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await userModel.findById(userId);

        if (!user) return res.status(404).json("User not found...");

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// getUsers
const getUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = {  loginUser, findUser, getUsers, addTeacher, addStudent };
