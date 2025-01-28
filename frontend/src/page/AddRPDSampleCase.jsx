import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import Add_RPD from "../components/lesson/RPDSampleCase/Add_RPD";
// import ChatBox from "../components/Noti";
import './sidebar-mobile.css'; 
const AddRPDSampleCase = () => {
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
          <Add_RPD />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  );
}
 
export default AddRPDSampleCase;