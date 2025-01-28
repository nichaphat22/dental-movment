const Quiz = require("../Models/quiz");
const Question = require("../Models/question");
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
            image
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
            console.log(`${deletedQuestions.deletedCount} questions deleted successfully.`);
        }

        // ลบ Quiz
        await quiz.deleteOne();

        // ส่งข้อความตอบกลับ
        res.status(200).json({ message: "Quiz and associated questions deleted successfully" });
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

        res.status(200).json({ message: "Quiz updated successfully", quiz: updateQuiz });
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
    const { question, choices, correctAnswer,answerExplanation } = req.body;

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
        if (!question) return res.status(404).json({ message: "Question not found in this Quiz" });

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//update question
const updateQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    const { question, choices, correctAnswer,answerExplanation } = req.body;

    try {
        const updatedQuestion = await Question.findOneAndUpdate(
            { _id: questionId, quiz: quizId },
            { question, choices, correctAnswer,answerExplanation },
            { new: true }
        );

        if (!updatedQuestion) return res.status(404).json({ message: "Question not found in this Quiz" });

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete Question
const deleteQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;

    try {
        const question = await Question.findOneAndDelete({ _id: questionId, quiz: quizId });
        if (!question) return res.status(404).json({ message: "Question not found in this Quiz" });

        // เอา Question ออกจาก Quiz
        await Quiz.findByIdAndUpdate(quizId, { $pull: { questions: questionId } });

        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
    deleteQuestion
};