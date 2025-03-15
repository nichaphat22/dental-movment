const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  console.log("🔍 Verifying token:", req.headers.authorization);

  // รับค่า Token และรองรับทั้ง 'Bearer <TOKEN>' และ 'TOKEN' ตรง ๆ
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("✅ Decoded JWT:", decoded);

    req.user = decoded; // เพิ่มข้อมูลผู้ใช้ลงใน req
    req.userId = decoded._id;
    next();
  } catch (error) {
    console.error("❌ JWT Verification Failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token" });
    } else {
      return res.status(400).json({ error: "Token verification failed" });
    }
  }
};

module.exports = { verifyToken };
