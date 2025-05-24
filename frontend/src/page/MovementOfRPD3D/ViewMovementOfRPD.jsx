import React, { useState } from "react";

import NavBarLeft from "../../components/navbar/NavBarLeft";
import Frame from "../../components/Frame";
import View_MovementOfRPD from "../../components/lesson/MovementOfRPD/View_MovementOfRPD";
import View_Animation3d from "../../components/lesson/MovementOfRPD/View_Animation3D";
import ChatBox from "../../components/Noti";

const ViewMovementOfRPD = () => {
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
      <div className={`flex-1 p-4 transition-all duration-300  ml-0 space-y-4
        ${isExpanded ? "sm:ml-64" : "sm:ml-16"}`}>
        <Frame className="overflow-auto">
          <View_Animation3d />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  );
};

export default ViewMovementOfRPD;
