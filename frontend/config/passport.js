const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../Models/userModel');
const Student = require('../Models/studentModel');
const Teacher = require('../Models/teacherModel');
require('dotenv').config();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK,

        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value, // ดึงอีเมลจาก profile.emails
                        name: profile.displayName,
                        role: 'user', // กำหนดค่า role เริ่มต้น
                    });

                    // ตรวจสอบ role หาก role เป็น student หรือ teacher
                    if (user.role === 'student') {
                        const student = await Student.create({ user: user._id });
                        user.student = student._id;
                    } else if (user.role === 'teacher') {
                        const teacher = await Teacher.create({ user: user._id });
                        user.teacher = teacher._id;
                    }

                    await user.save();
                }

                return done(null, user); // ส่งข้อมูล user ให้ Passport
            } catch (error) {
                console.error(error);
                return done(error, null); // แจ้งข้อผิดพลาดไปยัง Passport
            }
        }
    )
);

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id); // เก็บเฉพาะ user ID
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
