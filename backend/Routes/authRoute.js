const express = require("express");
const passport = require("passport");
const multer = require("../middleware/multer");
require("dotenv").config();
const authController = require("../Controllers/authController");
const studentController = require("../Controllers/studentController");
const teacherController = require("../Controllers/teacherController");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const Student = require("../Models/studentModel");
const Teacher = require("../Models/teacherModel");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", passport.authenticate("local"), authController.login);
router.get("/logout", authController.logout);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// เปลี่ยน path https://dental-movmentofrpd.up.railway.app
//
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.CLIENT_URL || "http://localhost:8080"
    }/login`,
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
        roleRef: req.user.roleRef,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("✅ Redirecting with Token:", token);
    res.redirect(
      `${
        process.env.CLIENT_URL || "http://localhost:8080"
      }/login?token=${token}`
    );
  }
);

//เชื่อม 2 เว็บไซต์
//รับค่า token
router.get("/sso", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Token is required");
    }

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).send("Token expired");
    }

    const { userId, email, name, role, timestamp } = decoded;
    if (Date.now() - timestamp > 3600000) {
      // 1 ชั่วโมง
      return res.status(401).send("Token too old");
    }

    let user = await findOrCreateUser({
      externalId: userId,
      email,
      name,
      role,
    });

    req.session.userId = user.id;
    req.session.isLoggedIn = true;
    req.session.role = role;

    res.redirect(
      role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"
    );
  } catch (error) {
    console.error("SSO error:", error);
    res.status(401).send("Invalid token");
  }
});

router.get("/redirect-to-dental-online", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const token = jwt.sign(
      {
        externalId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        timestamp: Date.now(),
      },
      process.env.SSO_SECRET,
      { expiresIn: "5m" }
    );

    res.redirect(
      `https://dentalonlinelearning-production.up.railway.app/sso-login?token=${token}`
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  }
});

// เชื่อมไป web e-learning
// router.post("/sso-to-elearning", verifyToken, (req, res) => {
//   try {
//     const user = req.user; // ได้จาก middleware verifyToken (JWT ใน dentalweb)

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // 🔹 สร้าง Token สำหรับส่งไป e-learning
//     const token = jwt.sign(
//       {
//         userId: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         role: req.user.role,
//         timestamp: Date.now(),
//       },
//       process.env.SESSION_SECRET, // ใช้ Key เดียวกับ e-learning
//       { expiresIn: "1h" }
//     );

//     // 🔹 Redirect ไปที่ e-learning พร้อมส่ง Token
//     const elearningURL= `https://dentalonlinelearning-production.up.railway.app/sso?token=${token}`
//     res.json({ elearningURL});
//   } catch (error) {
//     console.error("SSO to e-learning error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

//----------------------------------------------------------------------//
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

router.post(
  "/uploadStudent",
  upload.single("file"),
  studentController.uploadedFile
);

//เพิ่มผู้ใช้
router.post("/addUser", verifyToken, async (req, res) => {
  try {
    const { email, name, role, studentID, img } = req.body;

    if (!email || !name) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกข้อมูล email และ name ให้ครบ" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "อีเมลนี้มีอยู่ในระบบแล้ว" });
    }

    const profileImage =
      img ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        email
      )}&background=random`;

    const userRole = role || "student" || "teacher";

    const user = new User({
      email,
      name,
      role: userRole,
      img: profileImage,
      isDeleted: false,
    });
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
        user: user._id,
      });
      user.roleData = teacher._id;
      user.roleRef = "Teacher";
    }

    await user.save();
    console.log("✅ User Created:", user);

    const io = req.app.get("socketio");
    io.emit("userAdded", {
      message: "เพิ่มผู้ใช้ใหม่",
      user,
    });

    return res.status(201).json({
      message: "เพิ่มผู้ใช้สำเร็จ",
      user,
    });
  } catch (error) {
    console.error("❌ Error Adding User:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

//ดึงนักศึกษาทั้งหมด
router.get("/students", studentController.getAllStudents);
router.get("/teachers", teacherController.getAllTeachers);

//ดึงนักศึกษาที่ถูกลบ Soft Delete
router.get("/students/softDelete", studentController.getDeletedStudents);
router.get("/users/softDelete", studentController.getDeletedUsers);

//ลบ Soft Delete หลายรายการ
router.put("/students/softDelete/delete-multiple",studentController.softDeleteMultipleStudents);

//กู้คืนแบบอันเดียว
router.put("/students/restore", studentController.restoreStudents);
router.put("/teachers/restore", teacherController.restoreTeacher);

//กู้คืนแบบหลายอัน
router.put("/students/restoreMultiple", studentController.restoreMultipleStudents);
router.put("/teachers/restoreMultiple", teacherController.restoreMultipleTeachers);




router.delete("/students/delete-multiple",verifyToken,studentController.deleteMultipleStudents);
router.delete("/teachers/delete-multiple",verifyToken, teacherController.deleteMultipleTeachers);

//ลบ Soft Delete
router.put("/students/softDelete/:studentId",studentController.softDeleteStudent);
router.put("/teachers/softDelete/:teacherId", teacherController.softDeleteTeacher);


router.delete("/students/delete/:studentId",verifyToken,studentController.deleteStudent);
router.delete("/teachers/delete/:teacherId", verifyToken, teacherController.deleteTeacher);


// teacher

module.exports = router;
