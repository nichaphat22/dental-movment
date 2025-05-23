import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GoDeviceDesktop, GoVideo } from "react-icons/go";
import { HiCubeTransparent } from "react-icons/hi2";
import { TbChartScatter3D } from "react-icons/tb";
import { useSelector } from "react-redux";

const NavBarLeft = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const menuItemsForStudent = [
    { path: "/Biomechanical-consideration-student", label: "Biomechanical consideration", icon: <GoDeviceDesktop className=" w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> },
    { path: "/Possible-Movement-Of-RPD-student", label: "Possible movement of RPD", icon: <HiCubeTransparent className="w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> },
    { path: "/MovementOfRPD-student", label: "การเคลื่อนที่ของฟันเทียม", icon: <GoVideo className="w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> },
    { path: "/AR-RPD", label: "View AR", icon: <TbChartScatter3D className="w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> }
  ];

  const menuItemsForTeacher = [
    { path: "/Biomechanical-consideration-teacher", label: "Biomechanical consideration", icon: <GoDeviceDesktop className=" w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> },
    { path: "/Possible-Movement-Of-RPD-teacher", label: "Possible movement of RPD", icon: <HiCubeTransparent className="w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> },
    { path: "/MovementOfRPD-teacher", label: "การเคลื่อนที่ของฟันเทียม", icon: <GoVideo className="w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> },
    { path: "/AR-RPD", label: "View AR", icon: <TbChartScatter3D className="w-5 h-5 lg:w-6 lg:h-6 mr-2.5" /> }
  ]

  const menuItems = user?.role === "student" ? menuItemsForStudent : menuItemsForTeacher;

  return (
    <nav className="hidden sm:block fixed left-0 top-0 h-screen bg-white shadow-md mt-16 p-4 
                    md:w-56 lg:w-64 "> {/* Responsive width */}
      <h2 className="md:text-base lg:text-xl font-medium  text-gray-800 border-b-2 border-gray-500 pb-3 mb-3">
        BIOMECHANICS & POSSIBLE MOVEMENT
      </h2>

      {/* Links Section */}
      <div className="flex flex-col space-y-1 font-light">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 text-gray-800 transition duration-300 font-light text-sm lg:text-base py-2 px-2 rounded-md hover:bg-gray-100 cursor-pointer
              ${location.pathname === item.path ? "bg-gray-200 " : ""}`}
          >
            <span className="text-lg">{item.icon}</span> {/* ไอคอน */}
            <span className="font-normal">{item.label}</span> {/* ข้อความ */}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavBarLeft;
