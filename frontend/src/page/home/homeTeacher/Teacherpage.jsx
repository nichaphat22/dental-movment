import React, { useState } from "react";
import Sidebar from "../../../components/navbar/Sidebar";
import TableTeacher from "../../../components/Home/TableTeacher";

const Teacherpage = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div></div>
      <Sidebar
        isExpanded={isExpanded}
        toggleSidebar={() => setIsExpanded(!isExpanded)}
        className="mt-16"
      />

      {/* Content Area (ยืดตาม Sidebar) */}
      <div
        className={`flex-grow p-5 md:p-10 lg:p-4 mt-16 transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-10"
        }`}
      >
        <h1 className="text-xl font-bold  text-gray-600 border-b-2 pb-2">
          การจัดการผู้สอน
        </h1>
        <div className="p-2 mt-2 mb-16">
          <TableTeacher/>
        </div>
      </div>
    </div>
  );
};

export default Teacherpage;
