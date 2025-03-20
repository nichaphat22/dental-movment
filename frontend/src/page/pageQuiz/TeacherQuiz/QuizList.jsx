import React from "react";
import QuizListComponent from "../../../components/Quiz/Teacher/QuizList";
// import Frame from "../../../components/Frame"
import { useNavigate } from "react-router-dom";
import { HiPlusSm } from "react-icons/hi";

const QuizList = () => {
  const navigate = useNavigate();

  const handleAddQuiz = () => {
    navigate(`/Add-Quiz`);
  };

  return (
    <div className="mb-2 mt-20 md:mt-28" >
      <div className="container">
        <div className="font-semibold text-2xl pb-2 mt-8 lg:mx-20">
          <h1 className="text-center text-gray-600  text-lg md:text-2xl lg:text-3xl border-b-2 border-gray-200 pb-2">
            จัดการแบบทดสอบ
          </h1>
        </div>
      </div>

      {/* Button AddQuiz */}
      <div className="flex justify-end sm:mx-3 lg:mx-20 ">
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs md:text-sm px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleAddQuiz}
        >
          <HiPlusSm className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
          เพิ่มแบบทดสอบ
        </button>
      </div>

      {/* card quiz  */}
      
      <QuizListComponent />
    </div>
  );
};

export default QuizList;
