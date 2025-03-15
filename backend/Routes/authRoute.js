const express = require("express");
const passport = require("passport");
require("dotenv").config();
const authController = require("../Controllers/authController");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
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

module.exports = router;
