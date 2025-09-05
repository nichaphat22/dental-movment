const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const UserAction = require("../Models/UserActionModel");



// ดึง 5 รายการล่าสุด พร้อม populated ทุก field
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const actions = await UserAction.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("quizId", "title")              // quiz.title
      .populate("animationId", "Ani_name")      // animation.Ani_name
      .populate("animation3DId", "name animationFile")        // animation3D.name
      .populate("modelId", "name modelUrl ");             // model.name

    res.json(actions);
  } catch (error) {
    console.error("Error fetching recent actions:", error);
    res.status(500).json({ error: "Error fetching recent actions" });
  }
});

module.exports = router;


router.post("/", async (req, res) => {
  try {
    const { 
       userId, 
      action, 
      animationId, 
      quizId, 
      modelId, 
      animation3DId,
      quizTitle,
      modelTitle,
      animationTitle,
      animation3DTitle} =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // ลบข้อมูลที่มีอยู่แล้ว ถ้ามีการกดอันเดิม
    await UserAction.findOneAndDelete({
      userId,
      ...(quizId ? { quizId: new mongoose.Types.ObjectId(quizId) } : {}),
      ...(animationId ? { animationId: new mongoose.Types.ObjectId(animationId) } : {}),
      ...(modelId ? { modelId: new mongoose.Types.ObjectId(modelId)} : {}),
      ...(animation3DId ? {animation3DId: new mongoose.Types.ObjectId(animation3DId)} : {})
    });

    // สร้างข้อมูลใหม่ พร้อม title
    const updatedAction = new UserAction({
      userId,
      action,
      animationId: animationId ? new mongoose.Types.ObjectId(animationId) : null,
      quizId: quizId ? new mongoose.Types.ObjectId(quizId) : null,
      modelId: modelId ? new mongoose.Types.ObjectId(modelId) : null,
      animation3DId: animation3DId ? new mongoose.Types.ObjectId(animation3DId) : null,
      quizTitle: quizTitle || null,
      modelTitle: modelTitle || null,
      animationTitle: animationTitle || null,
      animation3DTitle: animation3DTitle || null,
      createdAt: new Date()
    });

    await updatedAction.save();

    // จำกัดให้เก็บข้อมูลแค่ 8 รายการล่าสุด
    const oldActions = await UserAction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(8)
      .select("_id");

    if (oldActions.length > 0) {
      await UserAction.deleteMany({
        _id: { $in: oldActions.map((a) => a._id) },
      });
    }

    res
      .status(201)
      .json({ message: "✅ บันทึกข้อมูลสำเร็จ", action: updatedAction });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "❌ ไม่สามารถบันทึกข้อมูลได้" });
  }
});

module.exports = router;
