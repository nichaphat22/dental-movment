import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import LectureHistory from "../components/lesson/RPDSampleCase/LectureHistory"
// import ChatBox from "../components/Noti";
// import '../tailwind.css'
import './sidebar-mobile.css'; 
const LectureHistoryImg = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return ( 
      <div  style={{marginTop: "100px"}} >
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
      <Frame >
           <LectureHistory/>
           </Frame>
        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
     );
}
 
export default LectureHistoryImg;