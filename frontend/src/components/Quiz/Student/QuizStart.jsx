import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../../utils/quizService";
import { GoSync } from "react-icons/go";

const QuizStart = () => {
  const { id } = useParams(); // id ของควิซที่เลือก
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null); // สำหรับเก็บข้อมูลควิซ
  const [answers, setAnswers] = useState([]); // สำหรับเก็บคำตอบที่ผู้ใช้เลือก
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // ดึงข้อมูลควิซจาก API
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(id);
        setQuiz(response.data.quiz);
        setAnswers(new Array(response.data.quiz.questions.length).fill(null)); // กำหนดค่าเริ่มต้นของคำตอบเป็น null
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (index) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = index; // เก็บคำตอบที่เลือก
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const submitScore = async () => {
    try {
      const userId = "USER_ID"; // ใช้ userId ที่แท้จริง
      const quizId = quiz._id; // id ของควิซ
      const correctAnswers = score; // คะแนนที่ได้จากการตอบถูก
      const totalQuestions = quiz.questions.length; // จำนวนคำถามทั้งหมด

      // ส่งข้อมูลคะแนนไปยัง backend
      const response = await quizService.submitResult(
        userId,
        quizId,
        correctAnswers,
        totalQuestions
      );
      console.log("Score submitted successfully:", response.data);
    } catch (error) {
      // การจัดการข้อผิดพลาด
      console.error("Error submitting score:", error);
      alert("มีข้อผิดพลาดในการส่งคะแนน กรุณาลองใหม่อีกครั้ง");
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        totalScore += 1;
      }
    });
    setScore(totalScore);

    // ส่งคะแนนไปยัง backend หลังจากคำนวณคะแนนเสร็จ
    submitScore();
  };

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl w-full">
        {!showResults ? (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
              {quiz.questions[currentQuestionIndex].question}
            </h2>

            {/* ตรวจสอบว่าในคำถามมีรูปภาพหรือไม่ */}
            {quiz.questions[currentQuestionIndex].image && (
              <div className="flex justify-center text-center mb-4">
                <img
                  src={quiz.questions[currentQuestionIndex].image}
                  alt={`Question ${currentQuestionIndex + 1}`}
                  className="max-w-60 max-h-40 md:max-h-48 object-cover border rounded-none hover:transform-none shadow-none"
                />
              </div>
            )}

            <hr />
            <div className="mb-6 p-4 ">
              {quiz?.questions?.[currentQuestionIndex]?.choices ? (
                quiz.questions[currentQuestionIndex].choices.map(
                  (choice, index) => (
                    <div key={index} className="mb-2">
                      <label
                        className={`flex items-center space-x-3 p-2 border rounded-md shadow-inner cursor-pointer hover:bg-indigo-50 
                        ${
                          answers[currentQuestionIndex] === index
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={index}
                          checked={answers[currentQuestionIndex] === index}
                          onChange={() => handleAnswerChange(index)}
                          className=" hidden"
                        />
                        <span className="text-gray-800 text-sm font-medium ">
                          {choice}
                        </span>
                      </label>
                    </div>
                  )
                )
              ) : (
                <p className="text-gray-600">
                  ไม่มีตัวเลือกคำตอบสำหรับคำถามนี้
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                {currentQuestionIndex === quiz.questions.length - 1
                  ? "เสร็จสิ้น"
                  : "ถัดไป"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-purple-500 mb-4">
              คะแนนที่ได้: {score}/{quiz.questions.length}
            </h2>
            <div className="space-y-4 text-left">
              {quiz.questions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-md bg-gray-50 shadow-sm"
                >
                  <h4 className="font-bold text-gray-800">{`${index + 1}: ${
                    question.question
                  }`}</h4>
                  {/* แสดงรูปภาพถ้ามีในหน้า Review */}
                  {question.image && (
                    <div className="flex justify-center text-center my-4">
                      <img
                        src={question.image}
                        alt={`Question ${index + 1}`}
                        className="max-w-80 max-h-48 object-cover border rounded-none hover:transform-none shadow-none"
                      />
                    </div>
                  )}
                  <p className="text-gray-600">
                    <strong>คำตอบที่เลือก: </strong>
                    {answers[index] !== null
                      ? question.choices[answers[index]]
                      : "ไม่ได้เลือกคำตอบ"}
                  </p>
                  <p
                    className={`text-gray-600 ${
                      answers[index] === question.correctAnswer
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <strong>คำตอบที่ถูกต้อง: </strong>
                    {question.choices[question.correctAnswer]}
                  </p>
                  <p className="text-gray-500">
                    <strong>อธิบายคำตอบ: </strong>
                    {question.answerExplanation || "-"}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setAnswers(new Array(quiz.questions.length).fill(null)); //รีเซ็ตคำตอบ
                  setCurrentQuestionIndex(0); //กลับไอคำถามแรก
                  setShowResults(false); //ซ่อนหน้าผลลัพธ์
                  setScore(0);
                }}
                className="mt-6 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
              >
                <GoSync className="w-4 h-4 mr-2" />
                เริ่มใหม่
              </button>
              <button
                onClick={() => navigate("/ListQuiz")}
                className="mt-6 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizStart;
