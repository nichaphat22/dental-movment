import React, {useState} from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import  View_RPD_sample_case from "../components/lesson/RPDSampleCase/View_RPD_sample_case";
// import View_Biomechanical_consideration from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration";
import ChatBox from "../components/Noti";
import './sidebar-mobile.css'; 

const HomeTeacher = () => {
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
                <Frame >
                <View_RPD_sample_case/>
                {/* <View_Biomechanical_consideration/> */}
                </Frame>
            {/* ChatBox */}
                <ChatBox />
            </div>
            
        </div>
    );
}

export default HomeTeacher;