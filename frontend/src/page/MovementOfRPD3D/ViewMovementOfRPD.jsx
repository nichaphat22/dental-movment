import React, { useState } from "react";

import NavBarLeft from "../../components/navbar/NavBarLeft";
import Frame from "../../components/Frame";
import View_MovementOfRPD from "../../components/lesson/MovementOfRPD/View_MovementOfRPD";
import View_Animation3d from "../../components/lesson/MovementOfRPD/View_Animation3D"
import ChatBox from "../../components/Noti";
import '../sidebar-mobile.css'; 

const ViewMovementOfRPD = () => {
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
          <View_Animation3d />
        </Frame>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
}

export default ViewMovementOfRPD;
