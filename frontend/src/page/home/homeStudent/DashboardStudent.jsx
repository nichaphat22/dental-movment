import React, { useEffect, useState } from "react";
import Recents from "../../../components/Home/Recents";
import LectureHistory from "../../../components/lesson/RPDSampleCase/LectureHistory";
import BookMark from "../../../components/lesson/RPDSampleCase/BookMark";

import { useSelector } from "react-redux";

const DashboardStudent = () => {
  const userId = useSelector((state) => state.auth.user?._id); // ดึงจาก Redux
  console.log("🔍 userId:", userId);

  return (
    <div className="flex flex-col items-start mt-20 mx-auto p-6 ">
      
        <h1 className="text-2xl text-left">รายการล่าสุด</h1>
        {userId ? <Recents userId={userId} /> : <p>⏳ กำลังโหลด...</p>}
      

      {/* จัดกสรแบบทดสอบ */}
      <div className="w-full p-2 md:p-10 lg:p-4 ">
        <h2 className="text-2xl text-left text-black border-b-2 pb-2">
          ประวัติการเลกเชอร์
        </h2>
        <LectureHistory limit={3} showViewAll />
      </div>

      {/* รายการโปรด */}
      <div className="w-full p-2 md:p-10 lg:p-4 ">
        <h2 className="text-2xl text-left text-black border-b-2 pb-2">
          รายการโปรด
        </h2>
        <BookMark
          limit={3}
          showViewAllButton
          className="flex justify-center items-center"
        />
      </div>
    </div>
  );
};

export default DashboardStudent;
