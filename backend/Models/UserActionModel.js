const mongoose = require("mongoose");

const UserActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["สื่อการสอน3D", "ทำแบบทดสอบ", "บทเรียน","การเคลื่อนที่ของฟันเทียม"],
      required: true,
    },
    animationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animation",
      default: null,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model3D",
      default: null,
    },
    animation3DId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animation3D",
      default: null,
    },
    animation3DTitle:{
      type: String,
      default: null,
    },
    modelTitle:{
      type: String,
      default: null,
    },
    quizTitle: {
      type: String,
      default: null,
    },
    animationTitle: {
      type: String,
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// สร้าง Index เพื่อให้สามารถดึงข้อมูลได้เร็วขึ้น
UserActionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("UserAction", UserActionSchema);
