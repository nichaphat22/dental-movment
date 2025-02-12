import React, { useState, useEffect } from "react";
import quizService from "../../../utils/quizService";
// import resultService from "../../../utils/resultService";
import { useNavigate } from "react-router-dom";
import { PiClipboardTextDuotone } from "react-icons/pi";
import { Progress, Typography } from "@material-tailwind/react";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [quizScores, setQuizScores] = useState({}); // เพิ่ม state สำหรับเก็บคะแนนของแต่ละ quiz
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizService.getAllQuiz();
        if (response.data && Array.isArray(response.data.quiz)) {
          setQuizzes(response.data.quiz);
        } else {
          console.error("Expected an array but got", response.data);
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes", error);
        setQuizzes([]);
      }
    };
    fetchQuizzes();
  }, []);

  const fetchQuizScores = async (quizId) => {
    try {
      const response = await quizService.getQuizScores(quizId);
      console.log("Response from API:", response);
      if (response.data && response.data.userScores) {
        setQuizScores((prevScores) => ({
          ...prevScores,
          [quizId]: response.data.userScores,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch scores", error);
    }
  };
  

  const handleQuizClick = (id) => {
    navigate(`/Quiz/${id}`);
    fetchQuizScores(id); // ดึงคะแนนเมื่อคลิก quiz
  };

  return (
    <div className="relative grid grid-cols-1 gap-6 mt-4 m-10 md:m-60 cursor-pointer">
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <div
            key={quiz._id}
            onClick={() => handleQuizClick(quiz._id)}
            className="relative p-4 bg-white hover:border-b-4 hover:border-purple-500 inset-shadow-xs rounded-md drop-shadow-xl "
          >
            <div className="flex items-center">
              <div className="flex flex-col justify-between w-full md:px-4">
                <div>
                  <div className="flex items-center space-x-6 ">
                    <PiClipboardTextDuotone className="text-3xl md:text-4xl text-purple-600 mt-2 flex-shrink-0" />
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-700 cursor-pointer break-words whitespace-normal">
                      {quiz.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 ml-14 md:ml-16 mt-2 mb-2">
                    จำนวนข้อ: {quiz.questions?.length || 0}
                  </p>
                </div>

                <div className="mt-4 px-4 w-full">
                  <div className="mb-2 flex items-center justify-end gap-4">
                    <Typography color="blue-gray" className="text-sm font-medium">
                      {quizScores[quiz._id]
                        ? `${quizScores[quiz._id]}/${quiz.questions.length}`
                        : "ยังไม่ได้ทำ"}
                    </Typography>
                  </div>
                  <Progress
                    value={
                      quizScores[quiz._id]
                        ? (quizScores[quiz._id] / quiz.questions.length) * 100
                        : 0
                    }
                    size="sm"
                    color={
                      quizScores[quiz._id] === quiz.questions.length
                        ? "green"
                        : quizScores[quiz._id]
                        ? "orange"
                        : "gray"
                    }
                    className="bg-gray-100"
                  />
                </div>

                <div className="mt-4 text-sm text-gray-600 text-end">
                  วันที่สร้าง:{" "}
                  {new Date(quiz?.createdAt || Date.now()).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center flex justify-center mt-2">
          ไม่มีแบบทดสอบให้แสดง
        </p>
      )}
    </div>
  );
};

export default QuizList;
