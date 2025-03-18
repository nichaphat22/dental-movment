import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import View_LeverTeacher from "../components/lesson/Biomechanical_consideration/View_LeverTeacher";
import ChatBox from "../components/Noti";

const LeverTeacher = () => {
    return (
      <div className="mt-[100px] flex" >
          <NavBarLeft />
       
  
        {/* Main Content Area */}
        <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
          <Frame className="overflow-auto">
            <View_LeverTeacher />
          </Frame>
  
          {/* ChatBox */}
          {/* <ChatBox /> */}
        </div>
      </div>
    );
}
 
export default LeverTeacher;