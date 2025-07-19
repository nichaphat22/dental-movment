import React, { useState } from "react";
import NavBarLeft from "../../../components/navbar/NavBarLeft";
import Frame from "../../../components/Frame";
import View_RPD_sample_case from "../../../components/lesson/RPDSampleCase/View_RPD_sample_case";
// import View_Biomechanical_consideration from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration";
import ChatBox from "../../../components/Noti";
import Sidebar from "../../../components/navbar/Sidebar";
const HomeTeacher = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className="mt-[10px] flex">
      {/* Sidebar */}
      <Sidebar
        isExpanded={isExpanded}
        toggleSidebar={() => setIsExpanded(!isExpanded)}
        className="mt-16"
      />

      {/* Main Content Area */}
      <div className={`flex-grow p-5 md:p-10 lg:p-4 mt-16 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-10"
        }`}>
        <Frame className="overflow-auto">
          <View_RPD_sample_case />
        </Frame>
        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
};

export default HomeTeacher;
