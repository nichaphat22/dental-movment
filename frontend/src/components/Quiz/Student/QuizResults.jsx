import React, { useState, useRef } from "react";
import { Card, Button } from "react-bootstrap";
import { GoSync } from "react-icons/go";
import { useNavigate, useLocation } from "react-router-dom";
import { FcApproval ,FcOk} from "react-icons/fc";
import { Spinner } from "@material-tailwind/react";

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAnswer, setShowAnswer] = useState(false);
  const answerSectionRef = useRef(null); // อ้างอิงไปยังส่วนเฉลย
  const { quiz, answers, score } = location.state || {};
  const [loading, setLoading] = useState(true);

  if (!quiz || !quiz.questions) {
    return (
      <div className="text-center mt-10">
        <p>ไม่มีข้อมูลแบบทดสอบ กรุณาทำแบบทดสอบใหม่</p>
        <button
          onClick={() => navigate("/ListQuiz")}
          className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const handleShowAnswer = () => {
    setShowAnswer(!showAnswer);

    if (!showAnswer) {
      setTimeout(() => {
        answerSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // เลื่อนขึ้นไปอีกเล็กน้อยให้เผื่อพื้นที่ด้านบน
        setTimeout(() => {
          window.scrollBy({ top: -150, left: 0, behavior: "smooth" });
        }, 300);
      }, 100); // รอให้ transition แสดงผลก่อน
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 mb-4 md:mx-14 lg:mx-32">
      <div
        className={`w-full max-w-md relative transition-all duration-500 ${
          showAnswer ? "scale-100 -translate-y-4 mt-4" : "scale-100"
        }`}
      >
        <Card className=" shadow-lg p-6 text-center">
          <div className="flex items-center justify-center">
            <FcOk className="w-20 h-20 md:w-28 md:h-28" />
          </div>
          <h2 className="text-sm md:text-lg lg:text-xl font-bold text-gray-800 pt-2 mb-2">
            คะแนนที่ได้
          </h2>
          <p className="text-4xl md:text-5xl font-bold text-purple-600 my-2">
            {score}/{quiz?.questions?.length || 0}
          </p>
          <button
            onClick={handleShowAnswer}
            className="mt-4 px-4 py-2 text-sm lg:text-base bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {showAnswer ? "ซ่อนเฉลย" : "ดูเฉลย"}
          </button>
        </Card>
      </div>

      <div
        ref={answerSectionRef} // ผูก ref กับส่วนเฉลย
        className={`w-full lg:max-w-4xl transition-opacity duration-500 ${
          showAnswer ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <div className="space-y-4 text-left p-4 border rounded-md bg-white shadow-sm">
          <div className="text-center text-purple-500 text-2xl">
            <p className="font-bold ">เฉลย</p>
          </div>
          {quiz.questions.map((question, index) => (
            <div
              key={index}
              className="p-4 text-sm md:text-base border rounded-md bg-gray-50 shadow-sm"
            >
              <h4 className="font-bold text-gray-800">{`${index + 1}: ${
                question.question
              }`}</h4>
              {question.image && (
                <div className="flex justify-center text-center my-4">
                  <img
                    src={question.image}
                    alt={`Question ${index + 1}`}
                    className="max-w-44 md:max-w-52 lg:max-w-80 max-h-48 object-cover border rounded-none shadow-none"
                  />
                </div>
              )}
              <p className="text-gray-600">
                <strong>คำตอบที่เลือก: </strong>
                {answers[index] != null
                  ? question.choices?.[answers[index]]
                  : "ไม่ได้เลือกคำตอบ"}
              </p>
              <p
                className={`${
                  parseInt(answers[index]) === parseInt(question.correctAnswer)
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <strong>คำตอบที่ถูกต้อง: </strong>
                {question.choices?.[question.correctAnswer]}
              </p>
              <p className="text-gray-500 text-xs md:text-sm">
                <strong>อธิบายคำตอบ: </strong>
                {question.answerExplanation || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4 text-sm md:text-base mt-4 mb-4 md:mb-8">
        <button
          onClick={() => navigate(`/quiz/${quiz._id}`)}
          className="mt-6 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
        >
          <GoSync className="w-4 h-4 mr-2" />
          เริ่มใหม่
        </button>
        <button
          onClick={() => navigate("/ListQuiz-student")}
          className="mt-6 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
