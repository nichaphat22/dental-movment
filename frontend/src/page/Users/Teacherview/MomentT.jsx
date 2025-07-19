import React, { useState } from 'react'
import Sidebar from '../../../components/navbar/Sidebar';
import Frame from '../../../components/Frame';
import View_Animation3D from '../../../components/lesson/MovementOfRPD/View_Animation3D';
const MomentT = () => {
    const [isExpanded, setIsExpanded] = useState(true);
  return (
     <div className="mt-[5px] flex">
       {/* Sidebar */}
      <Sidebar
        isExpanded={isExpanded}
        toggleSidebar={() => setIsExpanded(!isExpanded)}
        className="mt-16"
      />

      {/* Main Content Area */}
      <div className={`flex-grow p-5 md:p-10 lg:p-4 mt-16 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-10"
        }`}>
        <Frame className="overflow-auto">
          <View_Animation3D />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  )
}

export default MomentT
