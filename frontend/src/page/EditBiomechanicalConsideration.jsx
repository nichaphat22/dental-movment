import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import Edit_Biomechanical_consideration from "../components/lesson/Biomechanical_consideration/Edit_Biomechanical_consideration";
// import ChatBox from "../components/Noti";
import './sidebar-mobile.css'; 
const EditBiomechanicalConsideration = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div style={{marginTop: "100px"}} >
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
          <Edit_Biomechanical_consideration />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  );
}
 
export default EditBiomechanicalConsideration;