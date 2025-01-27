import React, { useState } from "react";
import NavBarLeft from "../../../components/navbar/NavBarLeft";
import Frame from "../../../components/Frame";
import Edit_MovementOfRPD from "../../../components/lesson/MovementOfRPD/Edit_MovementOfRPD";
import ChatBox from "../../../components/Noti";
import '../../sidebar-mobile.css'; 
const EditMovementOfRPD = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
      <div style={{ marginTop: "100px" }} >
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
            <Edit_MovementOfRPD />
          </Frame>
  
          {/* ChatBox */}
          <ChatBox />
        </div>
      </div>
    );
}

export default EditMovementOfRPD;