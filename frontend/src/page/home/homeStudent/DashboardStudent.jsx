import React, { useEffect, useState } from "react";
import Recents from "../../../components/Home/Recents";

import { useSelector } from "react-redux";

const DashboardStudent = () => {
  const userId = useSelector((state) => state.auth.user?._id); // ดึงจาก Redux
  console.log("🔍 userId:", userId);
  return (
    <div className="flex flex-col items-start mt-20 mx-auto p-6">
      
        <h1 className="text-2xl text-left">รายการล่าสุด</h1>
        {userId ? <Recents userId={userId} /> : <p>⏳ กำลังโหลด...</p>}
    
{/*      
        <h1 className="text-2xl  mb-4 text-left">รายการโปรด</h1>

        <h1 className="text-2xl  mb-4 text-left">ประวัติการเลกเชอร์</h1>
      */}
    </div>
  );
};

export default DashboardStudent;
