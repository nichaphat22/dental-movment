import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../../utils/quizService';

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
        console.error('Error fetching quiz:', error);
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

  const calculateScore = () => {
    let totalScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        totalScore += 1;
      }
    });
    setScore(totalScore);
  };

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen mt-24">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl w-full">
        {!showResults ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-700 mb-4 text-center">
              {quiz.questions[currentQuestionIndex].question}
            </h2>

            {/* ตรวจสอบว่าในคำถามมีรูปภาพหรือไม่ */}
            {quiz.questions[currentQuestionIndex].image && (
              <div className="text-center mb-4">
                <img
                  src={quiz.questions[currentQuestionIndex].image}
                  alt={`Question ${currentQuestionIndex + 1}`}
                  className="max-w-full h-auto rounded-lg border shadow-md"
                />
              </div>
            )}

            <hr />
            <div className="mb-6 p-4 border rounded-md bg-gray-50 shadow-sm mt-4">
              {quiz?.questions?.[currentQuestionIndex]?.choices ? (
                quiz.questions[currentQuestionIndex].choices.map((choice, index) => (
                  <div key={index} className="mb-4">
                    <label
                      className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-indigo-50 
                        ${answers[currentQuestionIndex] === index
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={index}
                        checked={answers[currentQuestionIndex] === index}
                        onChange={() => handleAnswerChange(index)}
                        className="form-radio h-5 w-5 text-indigo-500"
                      />
                      <span
                        className={`text-gray-800 text-sm ${
                          answers[currentQuestionIndex] === index ? 'font-semibold' : ''
                        }`}
                      >
                        {choice}
                      </span>
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">ไม่มีตัวเลือกคำตอบสำหรับคำถามนี้</p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? 'เสร็จสิ้น' : 'ถัดไป'}
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
                <div key={index} className="p-4 border rounded-md bg-gray-50 shadow-sm">
                  <h4 className="font-bold text-gray-800">{`${index + 1}: ${question.question}`}</h4>
                  {/* แสดงรูปภาพถ้ามีในหน้า Review */}
                  {question.image && (
                    <div className="text-center mb-4">
                      <img
                        src={question.image}
                        alt={`Question ${index + 1}`}
                        className="max-w-full h-auto rounded-lg border shadow-md"
                      />
                    </div>
                  )}
                  <p className="text-gray-600">
                    <strong>คำตอบที่เลือก: </strong>
                    {answers[index] !== null
                      ? question.choices[answers[index]]
                      : 'ไม่ได้เลือกคำตอบ'}
                  </p>
                  <p
                    className={`text-gray-600 ${
                      answers[index] === question.correctAnswer ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <strong>คำตอบที่ถูกต้อง: </strong>
                    {question.choices[question.correctAnswer]}
                  </p>
                  <p className="text-gray-500">
                    <strong>อธิบายคำตอบ: </strong>
                    {question.answerExplanation || '-'}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/ListQuiz')}
              className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              กลับหน้าหลัก
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuizStart;
