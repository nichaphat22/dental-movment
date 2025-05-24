import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GoDeviceDesktop, GoVideo } from "react-icons/go";
import { HiCubeTransparent } from "react-icons/hi2";
import { TbChartScatter3D } from "react-icons/tb";
import { useSelector } from "react-redux";
import {
  MdOutlineFormatIndentDecrease,
  MdOutlineFormatIndentIncrease,
} from "react-icons/md";

const NavBarLeft = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation();

  const menuItem = [
    {
      path: "/Biomechanical-consideration",
      label: "Biomechanical consideration",
      icon: <GoDeviceDesktop className=" h-6 w-6 lg:w-6 lg:h-6 mr-2.5" />,
    },
    {
      path: "/Possible-Movement-Of-RPD",
      label: "Possible movement of RPD",
      icon: <HiCubeTransparent className="h-6 w-6 lg:w-6 lg:h-6 mr-2.5" />,
    },
    {
      path: "/MovementOfRPD",
      label: "การเคลื่อนที่ของฟันเทียม",
      icon: <GoVideo className="h-6 w-6 lg:w-6 lg:h-6 mr-2.5" />,
    },
    {
      path: "/AR-RPD",
      label: "View AR",
      icon: <TbChartScatter3D className="h-6 w-6 lg:w-6 lg:h-6 mr-2.5" />,
    },
  ];

  // const menuItems =
  //   user?.role === "student" ? menuItemsForStudent : menuItemsForTeacher;

  return (
    <nav
      className={`hidden sm:flex fixed left-0 top-0 h-[calc(100vh-56px)] bg-white shadow-md mt-16 transition-all duration-300 flex-col
  ${isExpanded ? "w-64 p-4" : "w-16 p-2 items-center"}`}
    >
      {" "}
      {/* Responsive width */}
      <div
        className={`flex mb-3 border-b-2 border-gray-500  ${isExpanded ? "justify-between items-start " : "justify-center"}`}
      >
        <button
          className={`flex items-center justify-center text-gray-600 hover:text-black transition duration-300 p-2 rounded-md hover:bg-gray-100 
    ${!isExpanded ? "w-full" : "mr-2.5"}`}
          onClick={toggleSidebar}
        >
          {isExpanded ? (
            <MdOutlineFormatIndentIncrease className="h-6 w-6" />
          ) : (
            <MdOutlineFormatIndentDecrease className="h-6 w-6 justify-center my-2" />
          )}
        </button>
        <h2
          className={`text-gray-800 font-medium 
     text-base  ${isExpanded ? "" : "hidden"}`}
        >
          BIOMECHANICS & POSSIBLE MOVEMENT
        </h2>
      </div>
      {/* Links Section */}
      <div className="flex-1 overflow-y-auto flex flex-col space-y-3.5 w-full">
        {menuItem.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center transition duration-300 font-light text-sm lg:text-base p-2.5 rounded-md hover:bg-gray-100 cursor-pointer
              ${
                location.pathname === item.path ? "bg-gray-200 " : ""
              } ${!isExpanded ? "items-center font-normal" : ""}
              ${isActive ? "bg-gray-200 text-purple-600 font-normal" : "text-gray-600 hover:bg-gray-100 hover:text-purple-500"}
              `}
            >
              <span
                className={`group-hover:text-purple-500 ${isActive ? "text-purple-600" : "text-gray-500"}`}
              >
                {item.icon}
              </span>{" "}
              {/* ไอคอน */}
              {isExpanded && (
                <span
                  className={`ml-2 group-hover:text-purple-500 font-normal ${isActive ? "text-purple-600 " : "text-gray-600"}`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBarLeft;
