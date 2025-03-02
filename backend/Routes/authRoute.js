const express = require("express");
const passport = require("passport");
require('dotenv').config();
const authController = require("../Controllers/authController");

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
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    if (!req.user) {
    //   return res.redirect("http://localhost:5173/login"); // Redirect ถ้าไม่มี user
    return res.status(401).json({ message: "Authentication failed" });
    }
    
        // ✅ สร้าง JWT Token
        const token = jwt.sign(
            { id: req.user._id, role: req.user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        console.log("✅ Redirecting with Token:", token);

        // ✅ Redirect ไป frontend พร้อมแนบ token
        res.redirect(`http://localhost:5173/login?token=${token}`);
   }


);

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

module.exports = router;
