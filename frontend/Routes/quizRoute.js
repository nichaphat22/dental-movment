const express = require("express");
const router = express.Router();
const {
  createQuiz,
  deleteQuiz,
  updateQuiz,
  getAllQuiz,
  getQuizById,
  getQuestionsByQuizId,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../Controllers/quizController");

// Quiz routes
router.post("/addQuiz", createQuiz); // เพิ่มควิซ
router.delete("/:id", deleteQuiz); // ลบควิซ
router.put("/:id", updateQuiz); // อัปเดตควิซ
router.get("/", getAllQuiz); // ดึงข้อมูลควิซทั้งหมด
router.get("/:id", getQuizById); // ดึงควิซตาม ID

// Question routes
router.get("/:quizId/questions", getQuestionsByQuizId); // ดึงคำถามทั้งหมดในควิซ
router.get("/:quizId/questions/:questionId", getQuestionById); // ดึงคำถามตาม ID
router.post("/:quizId/questions", createQuestion); // เพิ่มคำถามในควิซ
router.put("/:quizId/questions/:questionId", updateQuestion); // อัปเดตคำถาม
router.delete("/:quizId/questions/:questionId", deleteQuestion); // ลบคำถาม

module.exports = router;
