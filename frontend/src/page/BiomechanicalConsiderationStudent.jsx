import React, {useState} from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import View_Biomechanical_consideration_Student from "../components/lesson/Biomechanical_consideration/View_Biomechanical_consideration_Student";
import ChatBox from "../components/Noti";
import './sidebar-mobile.css'; 
const BiomechanicalConsideration = () => {
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
                    <View_Biomechanical_consideration_Student />
                </Frame>
                
                <ChatBox/>
            </div>
            
        </div>
    );
}

export default BiomechanicalConsideration;
