import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { API } from "../../api/api";
import { logout } from "../../redux/authSlice";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiSearch,
  HiOutlineBell,
} from "react-icons/hi";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import MenuProfile from "../Profile/MenuProfile";
import NotificationBell from "../Notification/NotificationBell";
import "../../tailwind.css";
import Notifications from "../chat/Notifications";
import { GoDeviceDesktop, GoVideo } from "react-icons/go";
import { HiCubeTransparent } from "react-icons/hi";
import { TbChartScatter3D } from "react-icons/tb";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const img = useSelector((state) => state.auth.img);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const path = location.pathname;
  const isActive = (itemPath) => path.startsWith(itemPath);

  console.log(img);

  const handleLogout = () => {
    dispatch(logout()); // เคลียร์ Redux State
    navigate("/login"); // Redirect ไปหน้า Login
  };

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleLessonDropdown = () => {
    setIsLessonDropdownOpen(!isLessonDropdownOpen);
  };

  useEffect(() => {
    const isLessonPath =
      path.startsWith("/Biomechanical-consideration") ||
      path.startsWith("/Possible-Movement-Of-RPD") ||
      path.startsWith("/MovementOfRPD");

    if (isLessonPath) {
      setIsLessonDropdownOpen(true);
    }
  }, [path]);

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-2 px-4">
        {/* Mobile Menu Icon */}
        <div className="lg:hidden flex justify-between items-center w-full">
          {/* Left section: Menu button and Logo */}
          <div className="flex items-center space-x-2">
            <button onClick={toggleMenu}>
              {isOpen ? (
                <HiOutlineX className="text-3xl text-purple-600" />
              ) : (
                <HiOutlineMenu className="text-3xl text-purple-600" />
              )}
            </button>

            {/* Logo */}
            <div className="text-2xl font-bold text-purple-600">
              <Link
                to={
                  user?.role === "student"
                    ? "/dashboard-student"
                    : "/dashboard-teacher"
                }
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/th/thumb/1/19/DENTISTRY_KKU.svg/800px-DENTISTRY_KKU.svg.png"
                  alt="Logo"
                  width="50"
                  height="50"
                />
              </Link>
            </div>
          </div>

          {/* Right section: Notifications or Login */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative flex items-center space-x-1">
                <Notifications />
                <NotificationBell />
                <MenuProfile />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* <Link to="/login" className="text-purple-600 font-bold">
                  Google Login
                </Link> */}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-4 items-center justify-between w-full">
          <div className="flex space-x-4 items-center">
            {" "}
            {/* เมนูซ้าย */}
            <Link
              to={
                user?.role === "student"
                  ? "/dashboard-student"
                  : "/dashboard-teacher"
              }
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/th/thumb/1/19/DENTISTRY_KKU.svg/800px-DENTISTRY_KKU.svg.png"
                alt="Logo"
                width="50"
                height="50"
              />
            </Link>
            {user?.role === "student" && (
              <>
                <Link
                  to="/Biomechanical-consideration"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  บทเรียน
                </Link>

                <Link
                  to="/ListQuiz-student"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  แบบทดสอบ
                </Link>
              </>
            )}
            {user?.role === "teacher" && (
              <>
                <Link
                  to="/Biomechanical-consideration"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  บทเรียน
                </Link>
              </>
            )}
          </div>

          {/* User Profile (Right Aligned) */}
          <div className="ml-auto flex items-center">
            {user ? (
              <div className="relative flex items-center space-x-1">
                <a
                  href="/redirect-to-dental-online"
                  className="text-purple-600 group flex items-center"
                >
                  Online Learning
                  <HiOutlineArrowLongRight className="ml-1.5 text-xl transition-transform duration-300 group-hover:translate-x-2 group-hover:-rotate-45 mr-6" />
                </a>
                <Notifications />
                <NotificationBell />
                <MenuProfile />
              </div>
            ) : (
              <div className="flex items-center space-x-4"></div>
            )}
          </div>
        </div>
      </div>

      {/* Side Navbar for Mobile */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={closeMenu}
          />

          {/* Side Menu */}
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50">
            <div className="p-4 flex justify-between items-center">
              <span className="text-2xl font-bold text-purple-600">
                <Link
                  to={
                    user?.role === "student"
                      ? "/dashboard-student"
                      : "/dashboard-teacher"
                  }
                  onClick={closeMenu}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/th/thumb/1/19/DENTISTRY_KKU.svg/800px-DENTISTRY_KKU.svg.png"
                    alt="Logo"
                    width="50"
                    height="50"
                  />
                </Link>
              </span>
              <button onClick={toggleMenu}>
                <HiOutlineX className="text-2xl text-purple-600" />
              </button>
            </div>

            <nav className="flex flex-col space-y-4 px-4">
              {/* Conditional Links Based on Role */}
              {user?.role === "student" && (
                <>
                  <div className="relative">
                    <div
                      onClick={toggleLessonDropdown}
                      className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-normal">บทเรียน</span>
                        {isLessonDropdownOpen ? (
                          <FiChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <FiChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </div>
                    {isLessonDropdownOpen && (
                      <div className="pl-0">
                        <Link
                          to="/Biomechanical-consideration"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/Biomechanical-consideration")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <GoDeviceDesktop className="w-6 h-6 mr-2.5" />
                          Biomechanical consideration
                        </Link>
                        <Link
                          to="/Possible-Movement-Of-RPD"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/Possible-Movement-Of-RPD")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <HiCubeTransparent className="w-6 h-6 mr-2.5" />
                          Possible movement of RPD
                        </Link>
                        <Link
                          to="/MovementOfRPD"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/MovementOfRPD")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <GoVideo className="w-5 h-5 mr-2.5" />
                          การเคลื่อนที่ของฟันเทียม
                        </Link>
                        <Link
                          to="/AR-RPD"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/AR-RPD")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <TbChartScatter3D className="w-5 h-5 mr-2.5" />
                          View AR
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/ListQuiz-student"
                    className="text-gray-800 hover:text-purple-600"
                    onClick={closeMenu}
                  >
                    แบบทดสอบ
                  </Link>
                  <a
                    href="/redirect-to-dental-online"
                    className="text-purple-800 group flex items-center font-semibold"
                  >
                    Online Learning
                    <HiOutlineArrowLongRight className="ml-1.5 text-xl transition-transform duration-300 group-hover:translate-x-2 group-hover:-rotate-45" />
                  </a>
                </>
              )}

              {user?.role === "teacher" && (
                <>
                  <div className="relative">
                    <div
                      onClick={toggleLessonDropdown}
                      className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-normal">บทเรียน</span>
                        {isLessonDropdownOpen ? (
                          <FiChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <FiChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </div>
                    {isLessonDropdownOpen && (
                      <div className="pl-0">
                        <Link
                          to="/Biomechanical-consideration"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/Biomechanical-consideration")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <GoDeviceDesktop className="w-6 h-6 mr-2.5" />
                          Biomechanical consideration
                        </Link>

                        <Link
                          to="/Possible-Movement-Of-RPD"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/Possible-Movement-Of-RPD")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <HiCubeTransparent className="w-6 h-6 mr-2.5" />
                          Possible movement of RPD
                        </Link>

                        <Link
                          to="/MovementOfRPD"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/MovementOfRPD")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <GoVideo className="w-5 h-5 mr-2.5" />
                          การเคลื่อนที่ของฟันเทียม
                        </Link>

                        <Link
                          to="/AR-RPD"
                          className={`flex px-2 py-2 mr-2.5 ${
                            isActive("/AR-RPD")
                              ? "bg-purple-100 text-purple-700 rounded-lg"
                              : "text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          } transition`}
                          onClick={closeMenu}
                        >
                          <TbChartScatter3D className="w-5 h-5 mr-2.5" />
                          View AR
                        </Link>
                      </div>
                    )}
                  </div>

                  <a
                    href="/redirect-to-dental-online"
                    className="text-purple-800 group flex items-center font-semibold"
                  >
                    Online Learning
                    <HiOutlineArrowLongRight className="ml-1.5 text-xl transition-transform duration-300 group-hover:translate-x-2 group-hover:-rotate-45" />
                  </a>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;
