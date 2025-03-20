import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import BookMark from "../components/lesson/RPDSampleCase/BookMark";
// import ChatBox from "../components/Noti";
import './sidebar-mobile.css'; 
const Bookmark = () => {
     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return ( 
      <div className="mt-[100px] flex">

<NavBarLeft />
            {/* Main Content Area */}
            <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
                <Frame className="overflow-auto">

                <BookMark/>
           </Frame>

                {/* ChatBox */}
                {/* <ChatBox /> */}
            </div>
        </div>
    );
};
export default Bookmark;