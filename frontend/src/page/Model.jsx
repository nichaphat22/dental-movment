import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import ViewModel from "../components/lesson/RPDSampleCase/ViewModel"
// import ChatBox from "../components/Noti";
import './sidebar-mobile.css'; 

const Model = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
      <div style={{ marginTop: "65px" ,}} >
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
        {/* style={{ borderRadius: "0",background:'', maxHeight: "10vw",borderTop:'none'}} */}
          <Frame>
            <ViewModel />
          </Frame>
  
          {/* ChatBox */}
          {/* <ChatBox /> */}
        </div>
      </div>
    );
}
 
export default Model;