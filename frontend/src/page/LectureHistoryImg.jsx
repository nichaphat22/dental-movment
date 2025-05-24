import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ⬅️ เพิ่ม useSelector
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import LectureHistory from "../components/lesson/RPDSampleCase/LectureHistory";
import Sidebar from "../components/navbar/Sidebar";
import { GoArrowLeft } from "react-icons/go";

const LectureHistoryImg = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user); // ⬅️ ดึง user จาก Redux

  const handleGoBack = () => {
    if (user?.role === "student") {
      navigate("/dashboard-student");
    } else if (user?.role === "teacher") {
      navigate("/dashboard-teacher");
    } else {
      navigate("/"); // fallback เผื่อไม่มี role
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ปุ่มกลับ */}
      <div 
      className="mt-24 ml-4 "
      onClick={handleGoBack}>
        <GoArrowLeft className="text-xl text-purple-600 cursor-pointer  hover:bg-gray-200 rounded-full "/>
      </div>

      
      <div className="flex-grow p-5 mt-16 md:p-10 lg:p-4">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl text-gray-600 border-b-2 pb-2">
            ประวัติการเลกเชอร์
          </h2>
        </div>

        <Frame className="overflow-auto">
          <LectureHistory />
        </Frame>
      </div>
    </div>
  );
};

export default LectureHistoryImg;
