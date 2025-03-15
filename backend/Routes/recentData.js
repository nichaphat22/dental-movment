const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const UserAction = require("../Models/UserActionModel");

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // ดึง 5 รายการล่าสุด
    const actions = await UserAction.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("quizId", "title")  // ดึงเฉพาะ `title` จาก Quiz
      .populate("animationId", "Ani_name");  // ดึงเฉพาะ `name` จาก Animation

    res.json(actions);
  } catch (error) {
    console.error("Error fetching recent actions:", error);
    res.status(500).send("Error fetching recent actions");
  }
});

router.post("/", async (req, res) => {
    try {
      const { userId, action, animationId, quizId } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
  
      // ลบข้อมูลที่มีอยู่แล้ว ถ้ามีการกดอันเดิม
      await UserAction.findOneAndDelete({
        userId,
        ...(quizId ? { quizId: new mongoose.Types.ObjectId(quizId) } : {}),
        ...(animationId ? { animationId: new mongoose.Types.ObjectId(animationId) } : {})
      });
      
  
      // สร้างข้อมูลใหม่
      const updatedAction = new UserAction({
        userId,
        action,
        animationId: animationId ? new mongoose.Types.ObjectId(animationId) : null,
        quizId: quizId ? new mongoose.Types.ObjectId(quizId) : null,
        createdAt: new Date(), // อัปเดตเวลาใหม่
      });
  
      await updatedAction.save();
  
      // จำกัดให้เก็บข้อมูลแค่ 5 รายการล่าสุด
      const userActions = await UserAction.find({ userId })
        .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
        .skip(5); // ข้าม 5 อันแรก และลบที่เหลือ
  
      if (userActions.length > 0) {
        await UserAction.deleteMany({ _id: { $in: userActions.map((a) => a._id) } });
      }
  
      res.status(201).json({ message: "✅ บันทึกข้อมูลสำเร็จ", action: updatedAction });
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      res.status(500).json({ error: "❌ ไม่สามารถบันทึกข้อมูลได้" });
    }
  });
  

module.exports = router;
