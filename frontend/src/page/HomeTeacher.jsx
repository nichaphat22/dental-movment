import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
// import View_RPD_sample_case from "../components/lesson/RPDSampleCase/View_RPD_sample_case";
import View_Biomechanical_consideration from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration";
import ChatBox from "../components/Noti";

const HomeTeacher = () => {
  return (
    <div className="mt-[100px] flex">
      <NavBarLeft />

      {/* Main Content Area */}
      <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
        <Frame className="overflow-auto">
          {/* <View_RPD_sample_case /> */}
          <View_Biomechanical_consideration />
        </Frame>
        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
};

export default HomeTeacher;
