const User = require("../Models/userModel");
const Student = require("../Models/studentModel");
const Teacher = require("../Models/teacherModel");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const createStudentOrTeacher = async (user) => {
  if (user.role === "student") {
    const newStudent = await Student.create({ user: user._id });
    user.student = newStudent._id;
  } else if (user.role === "teacher") {
    const newTeacher = await Teacher.create({ user: user._id });
    user.teacher = newTeacher._id;
  }
  await user.save();
};

exports.register = async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    await createStudentOrTeacher(newUser);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.googleLogin = async (accessToken, refreshToken, profile, done) => {
  console.log("Google Profile:", profile); // เช็คข้อมูลโปรไฟล์
  try {
    console.log("✅ Access Token:", accessToken);
    console.log("✅ Refresh Token:", refreshToken);
    console.log("✅ Google Profile:", profile);

    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        img: profile.photos[0].value,
        role: "student",
      });

      await user.save();
      await createStudentOrTeacher(user);
    }

    // สร้าง token
    const token = jwt.sign(
      { 
        userId: user._id, 
        name: user.name,
        email: user.email,
        img: user.img,
        role: user.role, 
        roleData: user.roleData,

      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ส่ง token กลับไปยัง client
    res.json({ token });
    console.log("✅ User found/created:", user);
    return done(null, user, { token });
  } catch (error) {
    return done(error);
  }
};

exports.login = (req, res) => {
  res.json(req.user);
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    // Clear the session cookie
    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: false, // Change to true in production with HTTPS
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out" });
  });
};


