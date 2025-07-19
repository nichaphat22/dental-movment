import React, { useState } from 'react'
import NavBarLeft from '../../../components/navbar/NavBarLeft'
import ViewModel from '../../../components/lesson/RPDSampleCase/ViewModel'
import Frame from '../../../components/Frame'
import Sidebar from '../../../components/navbar/Sidebar'


const ModelT = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };
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
          <ViewModel />
        </Frame>
      </div>
    </div>
  )
}

export default ModelT
