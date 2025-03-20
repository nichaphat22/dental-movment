const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    score: { 
      type: Number, 
      required: true 
    }, // คะแนนที่ได้
    createdAt: { type: Date, default: Date.now }
  },
  {  timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
