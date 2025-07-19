import React, { useState, useEffect } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  GoPeople,
  GoRepo,
  GoClock,
  GoSync,
  GoPerson,
  GoBookmark,
  GoHistory,
  GoDeviceDesktop,
  GoVideo,
} from "react-icons/go";
import { PiClipboardTextDuotone } from "react-icons/pi";
import {
  MdLogout,
  MdOutlineFormatIndentIncrease,
  MdOutlineFormatIndentDecrease,
} from "react-icons/md";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { HiCubeTransparent } from "react-icons/hi";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation();
  const path = location.pathname;
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleLessonDropdown = () => {
    setIsLessonDropdownOpen(!isLessonDropdownOpen);
  };

  const closeLessonDropdown = () => {
    setIsLessonDropdownOpen(false);
  };

  useEffect(() => {
    const isLessonPath =
      path.startsWith("/Biomechanical-consideration-teacher") ||
      path.startsWith("/Possible-Movement-Of-RPD-teacher") ||
      path.startsWith("/MovementOfRPD-teacher");

      if (isLessonPath) {
        setIsLessonDropdownOpen(true);
      }
  }, [path]);
  return (
    <div
      className={`fixed top-14 left-0 h-[calc(100vh-56px)] shadow-xl bg-white transition-all duration-300 flex flex-col
    ${isExpanded ? "w-64 p-4" : "w-16 p-2 items-center"}`}
    >
      {/* ปุ่ม Toggle*/}
      <button
        className=" mt-4 mb-4 px-2 w-full text-gray-600 hover:text-black"
        onClick={toggleSidebar}
      >
        {isExpanded ? (
          <MdOutlineFormatIndentIncrease className="h-6 w-6" />
        ) : (
          <MdOutlineFormatIndentDecrease className="h-6 w-6" />
        )}
      </button>

      {/* เมนูรายการ */}
      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col space-y-3.5 w-full">
          <Link to="/dashboard-teacher#management">
            <MenuItem
              isExpanded={isExpanded}
              icon={<LuLayoutDashboard className="h-6 w-6" />}
              text="Dashboard"
              active={path === "/dashboard-teacher"}
            />
          </Link>
          <Link to="/dashboard-teacher#student">
            <MenuItem
              isExpanded={isExpanded}
              icon={<GoPeople className="h-6 w-6" />}
              text="จัดการนักศึกษา"
              active={
                path === "/dashboard-teacher" && location.hash === "#student"
              }
            />
          </Link>
          <Link to="/dashboard-teacher#lectureHistory">
            <MenuItem
              isExpanded={isExpanded}
              icon={<GoHistory className="h-6 w-6" />}
              text="ประวัติการเลกเชอร์"
              active={
                path === "/dashboard-teacher" &&
                location.hash === "#lectureHistory"
              }
            />
          </Link>
          <Link to="/dashboard-teacher#bookmark">
            <MenuItem
              isExpanded={isExpanded}
              icon={<GoBookmark className="h-6 w-6" />}
              text="รายการโปรด"
              active={
                path === "/dashboard-teacher" && location.hash === "#bookmark"
              }
            />
          </Link>
          <div className="relative">
            <div onClick={toggleLessonDropdown}>
              <MenuItem
                isExpanded={isExpanded}
                icon={<GoRepo className="h-6 w-6" />}
                text={
                  <div className="flex items-center justify-between w-full">
                    <span className="font-normal">จัดการบทเรียน</span>
                    {isLessonDropdownOpen ? (
                      <FiChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <FiChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                }
                active={
                  path.startsWith("/Biomechanical-consideration-teacher") ||
                  path.startsWith("/Possible-Movement-Of-RPD-teacher") ||
                  path.startsWith("/MovementOfRPD-teacher")
                }
              />
            </div>
            {isLessonDropdownOpen && (
              <div className="pl-0 text-sm">
                <Link
                  to="/Biomechanical-consideration-teacher"
                  className="block px-2 py-2 ml-1 text-gray-700 hover:bg-gray-100"
                >
                  <MenuItem
                    isExpanded={isExpanded}
                    icon={<GoDeviceDesktop className="h-5 w-5 " />}
                    text="Biomechanical consideration"
                    active={path === "/Biomechanical-consideration-teacher"}
                    // textClassName="text-purple-600"
                  />
                </Link>
                <Link
                  to="/Possible-Movement-Of-RPD-teacher"
                  className="block px-2 py-2 ml-1 text-gray-700 hover:bg-gray-100"
                >
                  <MenuItem
                    isExpanded={isExpanded}
                    icon={<HiCubeTransparent className="h-5 w-5 " />}
                    text="Possible movement of RPD"
                    active={path === "/Possible-Movement-Of-RPD-teacher"}
                  />
                </Link>
                <Link
                  to="/MovementOfRPD-teacher"
                  className="block px-2 py-2 ml-1 text-gray-700 hover:bg-gray-100"
                >
                  <MenuItem
                    isExpanded={isExpanded}
                    icon={<GoVideo className="h-5 w-5 " />}
                    text=" การเคลื่อนที่ของฟันเทียม"
                    active={path === "/MovementOfRPD-teacher"}
                  />
                </Link>
              </div>
            )}
          </div>

          <Link to="/ListQuiz-teacher">
            <MenuItem
              isExpanded={isExpanded}
              icon={<PiClipboardTextDuotone className="h-6 w-6" />}
              text="จัดการแบบทดสอบ"
              active={path === "/ListQuiz-teacher"}
            />
          </Link>

          <hr className="my-2 border-gray-300 border-3 rounded-md" />

          <Link to="/restore-teacher">
            <MenuItem
              isExpanded={isExpanded}
              icon={<GoSync className="h-6 w-6" />}
              text="กู้คืนรายชื่อ"
              active={path === "/restore-teacher"}
            />
          </Link>
          <Link to="/teacherPage">
            <MenuItem
              isExpanded={isExpanded}
              icon={<GoPerson className="h-6 w-6" />}
              text="ผู้สอน"
              active={path === "/teacherPage"}
            />
          </Link>
        </ul>
      </div>
    </div>
  );
};

/** 🔹 สร้าง Component สำหรับเมนู */
const MenuItem = ({
  isExpanded,
  icon,
  text,
  active,
  alert,
  textClassName = "",
}) => (
  <li
    className={`group flex items-center p-2.5 rounded-md hover:bg-gray-200 cursor-pointer transition-all ${
      !isExpanded && "justify-center"
    } ${
      active
        ? "bg-gradient-to-tr from-indigo-100 to-indigo-50"
        : "hover:bg-indigo-50 text-gray-600 "
    }`}
  >
    <span className="group-hover:text-black text-gray-600">{icon}</span>
    {isExpanded && (
      <span
        className={`ml-2 text-gray-700 group-hover:text-black font-normal ${textClassName}`}
      >
        {text}
      </span>
    )}
  </li>
);

export default Sidebar;
