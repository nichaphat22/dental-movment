import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import LectureHistory from "../components/lesson/RPDSampleCase/LectureHistory"
// import ChatBox from "../components/Noti";
// import '../tailwind.css'
import './sidebar-mobile.css'; 
const LectureHistoryImg = () => {
    // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return ( 
      <div className="mt-[100px] flex">

<NavBarLeft />
            {/* Main Content Area */}
            <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
                <Frame className="overflow-auto">

           <LectureHistory/>
           </Frame>

                {/* ChatBox */}
                {/* <ChatBox /> */}
            </div>
        </div>
    );
};

 
export default LectureHistoryImg;