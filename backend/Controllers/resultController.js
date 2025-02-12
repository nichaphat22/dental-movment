const Result = require("../Models/result");
const Quiz = require("../Models/quiz");
const User = require("../Models/userModel");

// บันทึกคะแนน
exports.submitResult = async (req, res) => {
    try {
      const { userId, quizId, correctAnswers, totalQuestions } = req.body;
  
      if (!userId || !quizId || correctAnswers === undefined || totalQuestions === undefined) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
      }
  
      const result = new Result({
        user: userId,
        quiz: quizId,
        correctAnswers,
        totalQuestions,
      });
  
      await result.save();
      res.status(200).json({ message: "บันทึกคะแนนสำเร็จ", result });
    } catch (error) {
      console.error("Error saving result:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกคะแนน" });
    }
  };

// ดึงผลคะแนน
exports.getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await Result.find({ user: userId }).populate('quiz', 'title');

    if (results.length === 0) {
      return res.status(404).json({ message: "ไม่พบผลการทดสอบ" });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคะแนน" });
  }
};
