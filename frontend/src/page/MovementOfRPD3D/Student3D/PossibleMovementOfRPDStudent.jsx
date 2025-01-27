import React, { useState } from "react";
import NavBarLeft from "../../../components/navbar/NavBarLeft";
import Frame from "../../../components/Frame";
import Student_View_RPD_sample_case from "../../../components/lesson/RPDSampleCase/Student_View_RPD_sample_case";
// import Student_Bio from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration_Student"
import ChatBox from "../../../components/Noti";
import '../../sidebar-mobile.css'; 

const HomeStudent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div style={{ marginTop: "100px" }}>
      {/* Sidebar for mobile */}
      <div
        className={`sidebar-mobile ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
      >
        <NavBarLeft />
      </div>

      {/* Desktop NavBarLeft */}
      <div className="sidebar-desktop">
        <NavBarLeft />
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <Frame>
          <Student_View_RPD_sample_case />
          {/* <Student_Bio/> */}

        </Frame>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
};

export default HomeStudent;
