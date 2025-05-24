import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/navbar/Sidebar";
import ListManagement from "../../../components/Home/ListManagement";
import TableStudent from "../../../components/Home/TableStudent";
import LectureHistory from "../../../components/lesson/RPDSampleCase/LectureHistory";
import BookMark from "../../../components/lesson/RPDSampleCase/BookMark";
import { useLocation } from "react-router-dom";

const DashboardTeacher = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const managementRef = useRef(null);
  const tableRef = useRef(null);
  const lectureHistoryRef = useRef(null);
  const bookmarkRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#management" && managementRef.current) {
      managementRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (location.hash === "#student" && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (location.hash === "#lectureHistory" && lectureHistoryRef.current) {
      lectureHistoryRef.current.scrollIntoView({ behavior: "smooth"});
    }
    if (location.hash === "#bookmark" && bookmarkRef.current) {
      bookmarkRef.current.scrollIntoView({ behavior: "smooth"});
    }
  }, [location]);

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
        {/* จำนวนข้อมูล */}
        <div className="p-2 mt-2 mb-16 scroll-mt-24" ref={managementRef}>
          <h1 className="text-xl font-bold text-gray-600 border-b-2 pb-2 mb-4">
            Dashboard
          </h1>
          <ListManagement />
        </div>
        {/* ตารางรายชื่อ */}
        <div className="p-2 md:p-10 lg:p-4 scroll-mt-24" ref={tableRef}>
          <h2 className="text-xl font-bold text-gray-600 border-b-2 pb-2">
            จัดการนักศึกษา
          </h2>
          <TableStudent />
        </div>

        {/* จัดกสรแบบทดสอบ */}
        <div className="p-2 md:p-10 lg:p-4 scroll-mt-24" ref={lectureHistoryRef}>
          <h2 className="text-xl font-bold text-gray-600 border-b-2 pb-2">
            ประวัติการเลกเชอร์
          </h2>
          <LectureHistory limit={3} showViewAll />
        </div>

        {/* รายการโปรด */}
        <div className="p-2 md:p-10 lg:p-4 scroll-mt-24" ref={bookmarkRef}>
          <h2 className="text-xl font-bold text-gray-600 border-b-2 pb-2">
            รายการโปรด
          </h2>
          <BookMark limit={3} showViewAllButton className="flex justify-center items-center" />
        </div>
      </div>
    </div>
  );
};

export default DashboardTeacher;
