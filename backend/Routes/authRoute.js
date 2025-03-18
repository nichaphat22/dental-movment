const express = require("express");
const passport = require("passport");
require("dotenv").config();
const authController = require("../Controllers/authController");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const Student = require("../Models/studentModel");
const Teacher = require("../Models/teacherModel");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", passport.authenticate("local"), authController.login);
router.get("/logout", authController.logout);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
    
  }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = jwt.sign(
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        img: req.user.img,
        role: req.user.role,
        roleData: req.user.roleData ? req.user.roleData._id : null,
        
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("✅ Redirecting with Token:", token);
    res.redirect(
      `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/login?token=${token}`
    );
  }
);


router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("roleData")
      .populate("notifications"); // ไม่คืนค่า password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


//เพิ่มผู้ใช้
router.post("/addUser", verifyToken, async (req, res) => {
  try {
    const { email, name, role, studentID, img } = req.body; 

  if(!email || !name) {  
    return res.status(400).json({ message: "กรุณากรอกข้อมูล email และ name ให้ครบ" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "อีเมลนี้มีอยู่ในระบบแล้ว"});
  }

  const profileImage = img || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  const userRole = role || "student";

  const user = new User({ email, name, role: userRole, img: profileImage});
  await user.save();

  if (userRole === "student") {
    console.log("🟢 Creating Student Profile...");
    const student = await Student.create({ 
      user: user._id,
      studentID: studentID || "",
    });
    user.roleData = student._id;
    user.roleRef = "Student";
    
  } else if (userRole === "teacher") {
    console.log("🟢 Creating Teacher Profile...");
    const teacher = await Teacher.create({ 
      user: user._id 
    });
    user.roleData = teacher._id;
    user.roleRef = "Teacher";
  }

  await user.save();
  console.log("✅ User Created:", user);

  return res.status(201).json({
    message: "เพิ่มผู้ใช้สำเร็จ",
    user,
  });
    
  } catch (error) {
    console.error("❌ Error Adding User:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
  
})

module.exports = router;
