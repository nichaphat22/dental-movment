import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import ViewModel from "../components/lesson/RPDSampleCase/ViewModel";
// import ChatBox from "../components/Noti";
import "./sidebar-mobile.css";

const Model = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };
  return (
    <div className="mt-16 flex">
      <div className="hidden sm:block">
      <NavBarLeft isExpanded={isExpanded} toggleSidebar={toggleSidebar} />

      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 p-4 transition-all duration-300  ml-0 space-y-4
          ${isExpanded ? "sm:ml-64" : "sm:ml-16"}`}
      >
        <Frame className="overflow-auto">
          <ViewModel />
        </Frame>
      </div>
    </div>
  );
};

export default Model;
