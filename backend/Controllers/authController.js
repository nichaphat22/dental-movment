const User = require('../Models/userModel');
const Student = require('../Models/studentModel');
const Teacher = require('../Models/teacherModel');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require("jsonwebtoken");

const createStudentOrTeacher = async (user) => {
    if (user.role === 'student') {
        const newStudent = await Student.create({ user: user._id });
        user.student = newStudent._id;
    } else if (user.role === 'teacher') {
        const newTeacher = await Teacher.create({ user: user._id });
        user.teacher = newTeacher._id;
    }
    await user.save();
}

exports.register = async (req , res ) => {
    const {email, password, name, role} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, name, role});

        await createStudentOrTeacher(newUser); 

        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({error:error.message});
    }
};

exports.googleLogin = async (accessToken, refreshToken, profile, done) => {
    console.log("Google Profile:", profile);  // เช็คข้อมูลโปรไฟล์
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                img: profile.photos[0].value,
                role: 'student',
            });

            await user.save();
            await createStudentOrTeacher(user);
        }

        // ✅ สร้าง JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        console.log("✅ User found/created:", user);
        return done(null, user, { token });

    } catch (error) {
        return done(error);
    }
}

exports.login = (req, res) => {
    res.json(req.user);
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.json({ message: 'Logged out' });
      });
      
};