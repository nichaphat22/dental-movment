import React, { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { GoPeople, GoRepo } from "react-icons/go";
import { PiClipboardTextDuotone } from "react-icons/pi";
import {
  MdLogout,
  MdOutlineFormatIndentIncrease,
  MdOutlineFormatIndentDecrease,
} from "react-icons/md";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-14 left-0 h-full shadow-xl bg-white transition-all duration-300 
        ${isExpanded ? "w-64 p-4" : "w-16 p-2 flex flex-col items-center"}`}
    >
      {/* ปุ่ม Toggle (แสดงเฉพาะจอเล็ก) */}
      <button
        className="lg:hidden mt-4 mb-4 px-2 w-full text-gray-600 hover:text-black"
        onClick={toggleSidebar}
      >
        {isExpanded ? (
          <MdOutlineFormatIndentIncrease className="h-6 w-6" />
        ) : (
          <MdOutlineFormatIndentDecrease className="h-6 w-6" />
        )}
      </button>

      {/* เมนูรายการ */}
      <ul className="flex flex-col space-y-3.5 w-full">
        <MenuItem
          isExpanded={isExpanded}
          icon={<LuLayoutDashboard className="h-6 w-6" />}
          text="Dashboard"
          active
        />
        <MenuItem
          isExpanded={isExpanded}
          icon={<GoPeople className="h-6 w-6" />}
          text="จัดการนักศึกษา"
        />
        <MenuItem
          isExpanded={isExpanded}
          icon={<GoRepo className="h-6 w-6" />}
          text="จัดการบทเรียน"
        />
        <MenuItem
          isExpanded={isExpanded}
          icon={<PiClipboardTextDuotone className="h-6 w-6" />}
          text="จัดการแบบทดสอบ"
        />
        <hr className="my-2 border-gray-300 border-3 rounded-md" />
        <MenuItem
          isExpanded={isExpanded}
          icon={<MdLogout className="h-6 w-6" />}
          text="ออกจากระบบ"
        />
      </ul>

      {/* <div className="border-t flex p-3">

      </div> */}
    </div>
  );
};

/** 🔹 สร้าง Component สำหรับเมนู */
const MenuItem = ({ isExpanded, icon, text, active ,alert}) => (
  <li
    className={`group flex items-center p-2.5 rounded-md hover:bg-gray-200 cursor-pointer transition-all ${
      !isExpanded && "justify-center"
    } ${
      active
        ?  "bg-gradient-to-tr from-indigo-100 to-indigo-50"
        :  "hover:bg-indigo-50 text-gray-600 "
    }`}
  >
    <span className="group-hover:text-black text-gray-600">{icon}</span>
    {isExpanded && (
      <span className="ml-2 text-gray-700 group-hover:text-black font-normal">{text}</span>
    )}
  </li>
);

export default Sidebar;

