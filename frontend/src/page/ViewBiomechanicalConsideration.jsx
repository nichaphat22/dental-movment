import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import View_Animation from "../components/lesson/Biomechanical_consideration/View_Animation";
import ChatBox from "../components/Noti";
// import '../tailwind.css'
const ViewBiomechanicalConsideration = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen mt-20" >
      {/* Sidebar for mobile */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-100 shadow-lg transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden w-64 z-40`}
      >
        <NavBarLeft />
      </div>

      {/* Desktop NavBarLeft */}
      <div className="hidden md:block w-1/5">
        <NavBarLeft />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-4/5">
        <Frame>
          <View_Animation />
        </Frame>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
}
 
export default ViewBiomechanicalConsideration;