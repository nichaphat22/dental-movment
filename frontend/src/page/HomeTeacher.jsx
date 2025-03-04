import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
// import View_RPD_sample_case from "../components/lesson/RPDSampleCase/View_RPD_sample_case";
import View_Biomechanical_consideration from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration";
// import ChatBox from "../components/Noti";
// import '../tailwind.css'
import './sidebar-mobile.css'; 

const HomeTeacher = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div style={{ marginTop: "100px" }}>
            {/* Sidebar for mobile */}
            <div
                className={`fixed top-0 left-0 h-full bg-gray-100 shadow-lg transition-transform transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:hidden w-64 z-40`}
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
                    {/* <View_RPD_sample_case /> */}
                    <View_Biomechanical_consideration />
                </Frame>
                {/* ChatBox */}
                {/* <ChatBox /> */}
            </div>
        </div>
    );
};

export default HomeTeacher;
