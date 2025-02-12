const Quiz = require("../Models/quiz");
const Question = require("../Models/question");
const Result = require("../Models/result");
const User = require("../Models/userModel");
const Notification = require("../Models/notificationModel");
const mongoose = require("mongoose");

//---------------Quiz---------------//

//get All Quiz
const getAllQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.find().populate("teacher", "name");

    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get a quiz byId
const getQuizById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Quiz ID" });
  }

  try {
    const quiz = await Quiz.findById(id).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a Quiz
const createQuiz = async (req, res) => {
  const { title, description, teacher, questions, image } = req.body;

  try {
    const newQuiz = new Quiz({
      title,
      description,
      // teacher,
      image,
    });

    await newQuiz.save();

    const createQuestions = [];
    for (const question of questions) {
      const newQuestion = new Question({
        question: question.question,
        image: question.image,
        choices: question.choices,
        correctAnswer: question.correctAnswer,
        answerExplanation: question.answerExplanation,
        quiz: newQuiz._id,
      });

      await newQuestion.save(); // บันทึกคำถาม
      createQuestions.push(newQuestion._id); // เก็บ ID ของคำถาม
    }

    //อัปเดต quiz ให้มี Question
    newQuiz.questions = createQuestions;
    await newQuiz.save();

    // แจ้งเตือนเมื่อสร้างแบบทดสอบ
    // const notification = new Notification({
    //   message: `แบบทดสอบใหม่: ${newQuiz.title} ถูกเพิ่มแล้ว!`,
    //   link: `/quiz/${newQuiz._id}`,
    //   isRead: false,
    // });

    // await notification.save();
    // req.io.emit("newNotification", notification);

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: newQuiz,
      questions: createQuestions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ลบ Quiz
const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    // ค้นหา Quiz ตาม ID
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // ลบคำถามที่เกี่ยวข้องทั้งหมดก่อน
    const deletedQuestions = await Question.deleteMany({ quiz: id });

    if (deletedQuestions.deletedCount > 0) {
      console.log(
        `${deletedQuestions.deletedCount} questions deleted successfully.`
      );
    }

    // ลบ Quiz
    await quiz.deleteOne();

    // ส่งข้อความตอบกลับ
    res
      .status(200)
      .json({ message: "Quiz and associated questions deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz or associated questions:", error);
    res.status(500).json({ error: error.message });
  }
};

//แก้ไข Quiz
const updateQuiz = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Quiz ID" });
  }

  const { title, description, teacher } = req.body;

  try {
    const updateQuiz = await Quiz.findByIdAndUpdate(
      id,
      { title, description, teacher },
      { new: true }
    );

    if (!updateQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    //แจ้งเตือน
    // const notification = new Notification({
    //   message: `แบบทดสอบ: ${updateQuiz.title} ถูกอัปเดต!`,
    //   link: `/quiz/${updateQuiz._id}`,
    //   isRead: false,
    // });

    // await notification.save();
    // req.io.emit("newNotification", notification);

    res
      .status(200)
      .json({ message: "Quiz updated successfully", quiz: updateQuiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//---------------------question--------------------//

//ดึงquestion ทั้งหมดใน Quiz
const getQuestionsByQuizId = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json(quiz.questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//เพิ่ม question new ใน Quiz
const createQuestion = async (req, res) => {
  const { quizId } = req.params;
  const { question, choices, correctAnswer, answerExplanation } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const newQuestion = new Question({
      question,
      choices,
      correctAnswer,
      answerExplanation,
      quiz: quizId,
    });

    await newQuestion.save();

    // เพิ่มคำถามเข้าใน Quiz
    quiz.questions.push(newQuestion._id);
    await quiz.save();

    //---------------------------------------------------------//
    // ✅ เพิ่มการแจ้งเตือนเมื่อมีการเพิ่มคำถามใหม่
    // const notification = new Notification({
    //     message: `มีคำถามใหม่ถูกเพิ่มในแบบทดสอบ: ${quiz.title}`,
    //     link: `/quiz/${quiz._id}`,
    //     isRead: false,
    // });

    // await notification.save();
    // req.io.emit("newNotification", notification); // ส่งแจ้งเตือนไปยัง WebSocket

    //---------------------------------------------------------//

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//ดึง question ById ใน Quiz
const getQuestionById = async (req, res) => {
  const { quizId, questionId } = req.params;

  try {
    const question = await Question.findOne({ _id: questionId, quiz: quizId });
    if (!question)
      return res
        .status(404)
        .json({ message: "Question not found in this Quiz" });

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update question
const updateQuestion = async (req, res) => {
  const { quizId, questionId } = req.params;
  const { question, choices, correctAnswer, answerExplanation } = req.body;

  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: questionId, quiz: quizId },
      { question, choices, correctAnswer, answerExplanation },
      { new: true }
    );

    if (!updatedQuestion)
      return res
        .status(404)
        .json({ message: "Question not found in this Quiz" });

    //---------------------------------------------------------//
    // ✅ เพิ่มการแจ้งเตือนเมื่ออัปเดตคำถาม
    //  const quiz = await Quiz.findById(quizId);
    //  const notification = new Notification({
    //      message: `คำถามในแบบทดสอบ: ${quiz.title} ถูกแก้ไข`,
    //      link: `/quiz/${quiz._id}`,
    //      isRead: false,
    //  });

    //  await notification.save();
    //  req.io.emit("newNotification", notification); // ส่งแจ้งเตือนไปยัง WebSocket

    //---------------------------------------------------------//

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete Question
const deleteQuestion = async (req, res) => {
  const { quizId, questionId } = req.params;

  try {
    const question = await Question.findOneAndDelete({
      _id: questionId,
      quiz: quizId,
    });
    if (!question)
      return res
        .status(404)
        .json({ message: "Question not found in this Quiz" });

    // เอา Question ออกจาก Quiz
    await Quiz.findByIdAndUpdate(quizId, { $pull: { questions: questionId } });

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//result
// บันทึกคะแนน
const submitResult = async (req, res) => {
  try {
    const { userId, quizId, correctAnswers, totalQuestions } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userId || !quizId || correctAnswers === undefined || totalQuestions === undefined) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    // สร้างผลลัพธ์ใหม่
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
// ตัวอย่างใน quizController.js
const getQuizResults = async (req, res) => {
  const { quizId } = req.params;
  try {
    // ค้นหาผลคะแนนตาม quizId โดยใช้ Result โมเดล
    const quizResults = await Result.find({ quiz: quizId }).populate("user", "name");

    if (quizResults && quizResults.length > 0) {
      res.status(200).json({ userScores: quizResults });
    } else {
      res.status(404).json({ message: "ไม่พบผลคะแนนสำหรับ quiz นี้" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงผลคะแนน" });
  }
};





module.exports = {
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
  submitResult,
  getQuizResults
 
};
