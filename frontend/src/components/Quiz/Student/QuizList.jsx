import React, { useState, useEffect } from 'react';
import quizService from '../../../utils/quizService';
import { useNavigate } from 'react-router-dom';
import defaultImage from "../../../../public/imgQuiz.svg";
// const defaultImage = 'https://via.placeholder.com/150'; // รูปภาพเริ่มต้น

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
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

  const handleQuizClick = (id) => {
    navigate(`/Quiz/${id}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-4 m-10 lg:m-64 cursor-pointer">
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <div
            key={quiz._id}
            onClick={() => handleQuizClick(quiz._id)}
            className="relative p-4 mb-4 bg-white border rounded-xl shadow-sm hover:bg-gray-100"
          >
            {/* คอนเทนต์หลัก */}
            <div className="flex">
              {quiz.image ? (
                <img
                  src={quiz.image}
                  alt={quiz.title}
                  className="w-40 h-40 rounded-md"
                />
              ) : (
                <img
                  src={defaultImage}
                  alt="Quiz"
                  className="w-40 h-40 object-cover rounded-md shadow-none"
                />
              )}

              <div className="ml-8 flex flex-col justify-between w-full mt-4">
                <div>
                  {/* ชื่อแบบทดสอบ */}
                  <h3 className="text-lg font-medium text-purple-500 lg:text-3xl mb-2">
                    {quiz.title}
                  </h3>

                  {/* จำนวนคำถาม */}
                  <p className="text-sm text-gray-600">
                    จำนวนข้อ: {quiz.questions?.length || 0}
                  </p>
                </div>

                {/* วันที่สร้าง */}
                <div className="mt-4 text-sm text-gray-600 text-end">
                  วันที่สร้าง: {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center flex justify-center mt-2">ไม่มีแบบทดสอบให้แสดง</p>
      )}
    </div>
  );
};

export default QuizList;
