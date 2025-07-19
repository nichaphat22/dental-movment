import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import View_Biomechanical_consideration_Student from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration_Student";
import ChatBox from "../components/Noti";
import Sidebar from "../components/navbar/Sidebar";

const BiomechanicalConsideration = () => {
  const [isExpanded, setIsExpanded] = useState(true);
      const toggleSidebar = () => {
          setIsExpanded((prev) => !prev);
      }
  return (
    <div className="mt-16 flex">
      <div className="hidden sm:block">
        <NavBarLeft isExpanded={isExpanded} toggleSidebar={toggleSidebar}/>

      </div>
      {/* Main Content Area */}
      <div className={`flex-1 p-4  transition-all duration-300 space-y-4 ml-0
        ${isExpanded ? "sm:ml-64" : "sm:ml-16"} `}>
        <Frame className="overflow-auto">
          <View_Biomechanical_consideration_Student />
        </Frame>

        {/* <ChatBox /> */}
      </div>
    </div>
  );
};

export default BiomechanicalConsideration;
