import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
// import Student_View_RPD_sample_case from "../components/lesson/RPDSampleCase/Student_View_RPD_sample_case";
import Student_Bio from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration_Student";
import ChatBox from "../components/Noti";

const HomeStudent = () => {
  return (
    <div className="mt-[100px] flex">
      <NavBarLeft />

      {/* Main Content Area */}
      <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
        <Frame className="overflow-auto">
          <Student_Bio />
        </Frame>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
};

export default HomeStudent;
