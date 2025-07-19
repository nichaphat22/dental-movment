import React, { useState } from "react";
import QuizListComponent from "../../../components/Quiz/Teacher/QuizList";
import { useNavigate } from "react-router-dom";
import { HiPlusSm } from "react-icons/hi";
import Sidebar from "../../../components/navbar/Sidebar";

const QuizList = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddQuiz = () => {
    navigate(`/Add-Quiz`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isExpanded={isExpanded}
        toggleSidebar={() => setIsExpanded(!isExpanded)}
        className="mt-16"
      />

      {/* Main Content */}
      <div
        className={`flex-grow p-5 md:p-10 lg:p-4 mt-16 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-10"
        }`}
      >
        {/* Header */}
        <div className="font-bold text-gray-600 text-sm md:text-lg lg:text-xl border-b-2 border-gray-200 pb-2 mb-6">
          จัดการแบบทดสอบ
        </div>

        {/* Add Quiz Button */}
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleAddQuiz}
          >
            <HiPlusSm className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            เพิ่มแบบทดสอบ
          </button>
        </div>

        {/* Quiz List */}
        <QuizListComponent />
      </div>
    </div>
  );
};

export default QuizList;
