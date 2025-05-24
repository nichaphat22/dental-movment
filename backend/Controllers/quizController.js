const Quiz = require("../Models/quiz");
const Question = require("../Models/question");
const Result = require("../Models/result");
const User = require("../Models/userModel");
const Teacher = require("../Models/teacherModel");
const Student = require("../Models/studentModel");
const Notification = require("../Models/notificationModel");
const mongoose = require("mongoose");
const notificationController = require("../Controllers/notificationController");
//---------------Quiz---------------//

//get All Quiz
const getAllQuiz = async (req, res) => {
  try {
    // ดึงข้อมูล quiz พร้อม populate teacher และ user
    const quizzes = await Quiz.find()
      .populate({
        path: "teacher", // populate ชื่ออาจารย์จาก Teacher
        populate: {
          path: "user", // populate ชื่อจาก User ที่เชื่อมโยงกับ Teacher
          select: "name", // ดึงแค่ชื่อของอาจารย์จาก User
        },
      })
      .exec();

    res.json({ quiz: quizzes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quizzes", error });
  }
};

//get a quiz byId
const getQuizById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Quiz ID" });
  }

  try {
    const quiz = await Quiz.findById(id)
      .populate("questions")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name email" },
      });

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
// สร้าง Quiz
const createQuiz = async (req, res) => {
  const { title, description, teacher, questions, role } = req.body;

  try {
    // ตรวจสอบว่า Teacher ID เป็น ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({ message: "Invalid Teacher ID" });
    }

    // ตรวจสอบข้อมูลที่จำเป็นในการสร้าง Quiz
    if (
      !title ||
      !description ||
      !teacher ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid data: title, description, teacher, and questions are required",
      });
    }

    // ตรวจสอบว่า Teacher ที่ระบุมีอยู่ในฐานข้อมูลหรือไม่
    const teacherData = await Teacher.findById(teacher);
    if (!teacherData) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // ✅ สร้าง Quiz ใหม่
    const newQuiz = await new Quiz({
      title,
      description,
      teacher: teacherData._id,
      questions: [], // เริ่มต้นโดยไม่มีคำถาม
    }).save();

    // ✅ สร้าง Questions และเพิ่มเข้าไปใน Quiz
    const createQuestions = await Promise.all(
      questions.map((question) =>
        new Question({
          question: question.question,
          image: question.image || null,
          choices: question.choices,
          correctAnswer: question.correctAnswer,
          answerExplanation: question.answerExplanation || "",
          quiz: newQuiz._id,
        }).save()
      )
    );

    // หลังจากสร้างคำถามเสร็จแล้ว, อัพเดต Quiz ด้วยคำถามที่สร้างขึ้น
    newQuiz.questions = createQuestions.map((q) => q._id);
    await newQuiz.save();

    // ✅ อัพเดต Teacher ให้เชื่อมโยงกับ Quiz ที่สร้างใหม่
    teacherData.quizzes.push(newQuiz._id); // เพิ่ม quiz ใหม่ใน quizzes ของ teacher
    await teacherData.save();

    // ✅ ส่งการแจ้งเตือนให้กับทั้งนักเรียนและคุณครู
    const io = req.app.get("socketio");

    // ส่งแจ้งเตือนให้กับนักเรียน
    await notificationController.sendNotification(
      "quiz_add", // ประเภทการแจ้งเตือน
      title, // ชื่อ Quiz
      newQuiz._id, // ID ของ Quiz
      "student", // ส่งให้กับนักเรียน
      io // ส่งแจ้งเตือนแบบเรียลไทม์
    );

    // ส่งแจ้งเตือนให้กับคุณครู
    await notificationController.sendNotification(
      "quiz_add", // ประเภทการแจ้งเตือน
      title, // ชื่อ Quiz
      newQuiz._id, // ID ของ Quiz
      "teacher", // ส่งให้กับคุณครู
      io // ส่งแจ้งเตือนแบบเรียลไทม์
    );

    const getAllQuizzes = await Quiz.find({
      isDeleted: { $ne: true },
    }).populate("questions");
    io.emit("quizUpdated", { quiz: getAllQuizzes });

    // ส่งผลลัพธ์ที่สำเร็จ
    res.status(201).json({
      message: "Quiz created successfully",
      quiz: newQuiz,
      questions: createQuestions,
    });
  } catch (error) {
    // ถ้ามีข้อผิดพลาดเกิดขึ้น, ส่งข้อความผิดพลาด
    res.status(500).json({ error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่า ID ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    // ค้นหา Quiz ตาม ID
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // ค้นหาผู้สอนที่เกี่ยวข้องกับควิซ
    const teacher = await Teacher.findOne({ quizzes: id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    console.log("Teacher quizzes:", teacher.quizzes);

    // ลบ quiz จาก quizzes ของผู้สอน
    teacher.quizzes = teacher.quizzes.filter(
      (quizId) => quizId.toString() !== id
    );
    await teacher.save();

    // ลบคำถามที่เกี่ยวข้องทั้งหมด
    await Question.deleteMany({ quiz: id });

    // ลบ Quiz
    await Quiz.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Quiz and associated questions deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz or associated questions:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateQuiz = async (req, res) => {
  const { title, description, teacher, questions, role } = req.body;
  const { id } = req.params; // ใช้ id จาก URL แทน quizId

  try {
    // ตรวจสอบว่า Quiz ID เป็น ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    // ค้นหา Quiz ที่ต้องการอัปเดต
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // ตรวจสอบว่า Teacher ที่ระบุมีอยู่ในฐานข้อมูลหรือไม่ (ถ้าต้องการอัปเดต Teacher)
    if (teacher) {
      const teacherData = await Teacher.findById(teacher);
      if (!teacherData) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      quiz.teacher = teacherData._id;
    }

    // อัปเดตข้อมูล Quiz (เฉพาะฟิลด์ที่มีการส่งมา)
    if (title) quiz.title = title;
    if (description) quiz.description = description;

    // อัปเดตข้อมูลคำถาม (questions)
    if (Array.isArray(questions)) {
      const existingQuestions = await Question.find({ quiz: quiz._id });

      // คัดกรองคำถามที่ต้องลบ, อัปเดต และเพิ่มใหม่
      const questionToDelete = existingQuestions.filter((q) =>
        questions.some((newQ) => newQ.deleted && newQ._id === q._id)
      );
      const questionsToUpdate = questions.filter((q) => q._id && !q.deleted);
      const questionsToAdd = questions.filter((q) => !q._id && !q.deleted);

      // ลบคำถามที่ต้องการลบ
      await Question.deleteMany({
        _id: { $in: questionToDelete.map((q) => q._id) },
      });

      // อัปเดตคำถามที่มีอยู่
      await Promise.all(
        questionsToUpdate.map((q) =>
          Question.findByIdAndUpdate(q._id, {
            question: q.question,
            choices: q.choices,
            image: q.image || null,
            correctAnswer: q.correctAnswer,
            answerExplanation: q.answerExplanation || "",
          })
        )
      );

      // เพิ่มคำถามใหม่
      const newQuestions = await Question.insertMany(
        questionsToAdd.map((q) => ({
          question: q.question,
          choices: q.choices,
          image: q.image || null,
          correctAnswer: q.correctAnswer,
          answerExplanation: q.answerExplanation || "",
          quiz: quiz._id,
        }))
      );

      quiz.questions = [
        ...existingQuestions
          .filter((q) => !questionToDelete.includes(q))
          .map((q) => q._id),
        ...newQuestions.map((q) => q._id),
      ];
    }

    // บันทึกการอัปเดต quiz
    await quiz.save();

    // ส่งการแจ้งเตือนการอัปเดต quiz
    // await notificationController.notificationQuizUpdate(quiz.title, quiz._id, role, req.io);

    // ✅ ส่งการแจ้งเตือนให้กับทั้งนักเรียนและคุณครู
    const io = req.app.get("socketio");

    // ส่งแจ้งเตือนให้กับนักเรียน
    await notificationController.sendNotification(
      "quiz_update", // ประเภทการแจ้งเตือน
      title, // ชื่อ Quiz
      quiz._id, // ID ของ Quiz
      "student", // ส่งให้กับนักเรียน
      io // ส่งแจ้งเตือนแบบเรียลไทม์
    );

    // ส่งแจ้งเตือนให้กับคุณครู
    await notificationController.sendNotification(
      "quiz_update", // ประเภทการแจ้งเตือน
      title, // ชื่อ Quiz
      quiz._id, // ID ของ Quiz
      "teacher", // ส่งให้กับคุณครู
      io // ส่งแจ้งเตือนแบบเรียลไทม์
    );

    // ✅ อัปเดต client แบบ real-time
    const allQuizzes = await Quiz.find({ isDeleted: { $ne: true } }).populate(
      "questions"
    );
    io.emit("quizUpdated", { quiz: allQuizzes });

    // ส่งผลลัพธ์ที่สำเร็จ
    res.status(200).json({
      message: "Quiz updated successfully",
      quiz: quiz,
      questions: questions,
    });
  } catch (error) {
    // ถ้ามีข้อผิดพลาดเกิดขึ้น, ส่งข้อความผิดพลาด
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
  const { question, choices, image, correctAnswer, answerExplanation } =
    req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const newQuestion = new Question({
      question,
      choices,
      image,
      correctAnswer,
      answerExplanation,
      quiz: quizId,
    });

    await newQuestion.save();

    // เพิ่มคำถามเข้าใน Quiz
    quiz.questions.push(newQuestion._id);
    await quiz.save();

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
  const { question, choices, image, correctAnswer, answerExplanation } =
    req.body;

  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: questionId, quiz: quizId }, // หาคำถามที่ตรงกับ quizId และ questionId
      { question, choices, image, correctAnswer, answerExplanation },
      { new: true } // คืนค่าคำถามที่ถูกอัปเดต
    );

    if (!updatedQuestion)
      return res
        .status(404)
        .json({ message: "Question not found in this Quiz" });

    res.status(200).json(updatedQuestion); // ส่งคำถามที่อัปเดตแล้วกลับไป
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

    // เอาคำถามออกจาก Quiz
    await Quiz.findByIdAndUpdate(quizId, { $pull: { questions: questionId } });

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//---------------------------------------result----------------------------------------///
// บันทึกคะแนน
const submitResult = async (req, res) => {
  try {
    const { student, quiz, score } = req.body;

    // ตรวจสอบว่าค่าที่รับมาตรงตามรูปแบบที่ถูกต้อง
    if (!student || !quiz || score == null) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    // ตรวจสอบว่า student และ quizId เป็น ObjectId ที่ถูกต้อง
    if (
      !mongoose.Types.ObjectId.isValid(student) ||
      !mongoose.Types.ObjectId.isValid(quiz)
    ) {
      return res.status(400).json({ message: "Invalid student or quizId" });
    }

    const studentObjectId = await Student.findById(student);
    if (!studentObjectId) {
      return res.status(404).json({ message: "Student not found" });
    }

    const quizObjectId = await Quiz.findById(quiz);
    if (!quizObjectId) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    console.log("🔍 Student:", studentObjectId);
    console.log("🔍 Quiz:", quizObjectId);

    const existingResult = await Result.findOne({ student, quiz });

    if (existingResult) {
      if (score > existingResult.score) {
        existingResult.score = score;
        await existingResult.save();

        studentObjectId.completedQuizzes.push({
          quiz,
          score,
          completedAt: Date.now(),
        });
        await studentObjectId.save();

        return res
          .status(200)
          .json({ message: "คะแนนถูกอัปเดต", result: existingResult });
      } else {
        return res
          .status(200)
          .json({ message: "คะแนนไม่ถูกอัปเดต เพราะยังไม่สูงขึ้น" });
      }
    } else {
      // สร้างและบันทึกผลคะแนนใหม่
      const newResult = new Result({ student, quiz, score });
      await newResult.save();

      studentObjectId.completedQuizzes.push({
        quiz,
        score,
        completedAt: Date.now(),
      });
      await studentObjectId.save();

      return res
        .status(201)
        .json({ message: "บันทึกคะแนนสำเร็จ", result: newResult });
    }
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกคะแนน" });
  }
};

// ดึงผลคะแนน

const getQuizResults = async (req, res) => {
  try {
    const { studentId } = req.params; // รับ studentId จาก URL params

    // ค้นหาผลคะแนนที่เชื่อมโยงกับ studentId
    const results = await Result.find({ student: studentId })
      .populate({
        path: "student", // populate ข้อมูลจาก Student
        select: "name email", // เลือกข้อมูลที่ต้องการจาก Student
      })
      .populate({
        path: "quiz", // populate ข้อมูลจาก Quiz
        select: "title", // เลือกข้อมูลที่ต้องการจาก Quiz
      })
      .exec();

    // ตรวจสอบว่ามีผลคะแนนหรือไม่
    if (results.length === 0) {
      return res.status(404).json({ message: "ไม่พบนักศึกษาหรือผลคะแนน" });
    }

    // ส่งผลลัพธ์กลับ
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผลคะแนน" });
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
  getQuizResults,
};
