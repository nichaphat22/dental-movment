import React, { useState } from "react";
import NavBarLeft from "../../../components/navbar/NavBarLeft";
import Frame from "../../../components/Frame";
import View_MovementOfRPD_Student from "../../../components/lesson/MovementOfRPD/View_MovementOfRPD_Student";
import ChatBox from "../../../components/Noti";

const MovementOfRPDStudent = () => {
  const [isExpanded, setIsExpanded] = useState(true);
        const toggleSidebar = () => {
            setIsExpanded((prev) => !prev);
        }
  return (
    <div className="mt-[60px] flex">
      <div className="hidden sm:block">
       <NavBarLeft isExpanded={isExpanded} toggleSidebar={toggleSidebar}/>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 p-4 transition-all duration-300 space-y-4 ml-0
        ${isExpanded ? "sm:ml-64" : "sm:ml-16"}  `}>
        <Frame className="overflow-auto">
          <View_MovementOfRPD_Student />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  );
};

export default MovementOfRPDStudent;
