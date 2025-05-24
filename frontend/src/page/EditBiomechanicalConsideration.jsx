import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import Edit_Biomechanical_consideration from "../components/lesson/Biomechanical_consideration/Edit_Biomechanical_consideration";
import ChatBox from "../components/Noti";
import Sidebar from "../components/navbar/Sidebar";

const EditBiomechanicalConsideration = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className="mt-[5px] flex" >
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
          <Edit_Biomechanical_consideration />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  );
}
 
export default EditBiomechanicalConsideration;