import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../../utils/quizService";
import QuizResults from "./QuizResults";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";

const QuizStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const user = useSelector(state => state.auth.user);
  const roleData = useSelector(state => state.auth.roleData)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(id);
        setQuiz(response.data.quiz);
        setAnswers(new Array(response.data.quiz.questions.length).fill(null));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (choiceIndex) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = choiceIndex;
      return updatedAnswers;
    });
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // คำนวณคะแนน
      const totalScore = answers.reduce((acc, answer, index) => {
        return answer === quiz.questions[index].correctAnswer ? acc + 1 : acc;
      }, 0);
  
      const resultData = {
        student: roleData, // ควรเป็น ObjectId
        quiz: id, // ควรเป็น ObjectId
        score: totalScore,
      };
  
      console.log("📤 ส่งข้อมูลไปที่ Backend:", resultData); // ✅ Debug ดูค่าที่ส่ง
  
      try {
        await quizService.submitResult(resultData);
        navigate(`/quiz/${id}/result`, {
          state: { quiz, answers, score: totalScore },
        });
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดขณะส่งคะแนน:", error.response?.data || error);
      }
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

  if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center space-x-3">
            <Spinner
              animation="grow"
              role="status"
              style={{
                width: "25px",
                height: "25px",
                marginRight: "8px",
                backgroundColor: "#a845f3",
              }}
            />
            <span className="text-gray-500 text-lg font-normal">กำลังโหลด...</span>
          </div>
        </div>
      );
    }

  // if (!quiz) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       Loading...
  //     </div>
  //   );
  // }

  return (
    <div className="mb-4">
      <h1 className="text-center mb-4 text-xl md:text-2xl text-purple-600 font-bold mx-10">
        ชื่อแบบทดสอบ: {quiz.title}
      </h1>
      <div className="flex justify-center items-center ">
        <div className="bg-white rounded-lg shadow-md max-w-5xl w-full md:mx-10">
          <div>
            <div className="bg-purple-50 p-4 rounded-t-md">
              <h2 className="text-gray-700 text-center text-sm md:text-base">
                {currentQuestionIndex + 1}.{" "}
                {quiz.questions[currentQuestionIndex].question}
              </h2>
            </div>
            {/* แสดงรูปภาพถ้ามีในคำถาม */}
            {quiz.questions[currentQuestionIndex].image && (
              <div className="flex justify-center text-center mt-3 mb-3">
                <img
                  src={quiz.questions[currentQuestionIndex].image}
                  alt={`Question ${currentQuestionIndex + 1}`}
                  className="max-w-60 max-h-40 md:max-h-48 object-cover border rounded-md shadow"
                />
              </div>
            )}
            <div className="mb-6 p-4">
              {quiz.questions[currentQuestionIndex].choices.map(
                (choice, index) => (
                  <div key={index} className="mb-2 md:mx-10">
                    <label
                      className={`flex items-center p-2.5 border rounded-md cursor-pointer hover:bg-gray-100 ${
                        answers[currentQuestionIndex] === index
                          ? "border-indigo-500 bg-purple-100"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={index}
                        checked={answers[currentQuestionIndex] === index}
                        onChange={() => handleAnswerChange(index)}
                        className="mr-2"
                      />
                      <span className="text-gray-600 text-xs md:text-sm font-normal">
                        {choice}
                      </span>
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between md:mx-44 mt-10 md:mt-12 text-xs md:text-sm">
        <div>
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="  px-4 py-2 bg-gray-200 text-gray-700  rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ย้อนกลับ
          </button>
        </div>
        {/* Pagination Buttons */}
        <div className="flex justify-center items-center space-x-3">
          {quiz.questions.map((_, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isAnswered = answers[index] !== null;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-semibold transition-all
          ${
            isCurrent
              ? "bg-orange-500"
              : isAnswered
              ? "bg-purple-500"
              : "bg-gray-300"
          }`}
              >
                {index + 1}
                {/* {isCurrent && index === 1 && <span className="absolute -mt-4">🐛</span>} */}
              </button>
            );
          })}
        </div>
        <div>
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
    </div>
  );
};

export default QuizStart;
