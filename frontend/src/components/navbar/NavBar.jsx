import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { API } from "../../api/api";
// import { logoutUser } from "../../redux/authSlice";
import { logout } from "../../redux/authSlice";
// import { AuthContext } from "../../context/AuthContext";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiSearch,
  HiOutlineBell,
} from "react-icons/hi";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
// import GoogleLogin from "../GoogleLoginButton";
import MenuProfile from "../Profile/MenuProfile";
import NotificationBell from "../Notification/NotificationBell";
import "../../tailwind.css";
// import { useContext, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../context/AuthContext';
// import { HiOutlineMenu, HiOutlineX, HiOutlineBell } from 'react-icons/hi';
// import GoogleLogin from "../GoogleLoginButton";
// import MenuProfile from '../Profile/MenuProfile';
// import '../../tailwind.css';
import Notifications from "../chat/Notifications";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  // const { user, logoutUser, loginWithGoogle } = useContext(AuthContext);
  const user = useSelector((state) => state.auth.user);
  const img = useSelector((state) => state.auth.img);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-2 px-4">
        {/* Mobile Menu Icon */}
        <div className="lg:hidden flex items-center space-x-2">
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
                  to="/lesson-student"
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
                <Link
                  to="/lectureHistory-student"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  ประวัติการเลกเชอร์
                </Link>
                <Link
                  to="/bookmark-student"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  รายการโปรด
                </Link>
              </>
            )}
            {user?.role === "teacher" && (
              <>
                <Link
                  to="/lesson-teacher"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  บทเรียน
                </Link>
                <Link
                  to="/ListQuiz-teacher"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  จัดการแบบทดสอบ
                </Link>
                <Link
                  to="/lectureHistory-teacher"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  ประวัติการเลกเชอร์
                </Link>
                <Link
                  to="/bookmark-teacher"
                  className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                >
                  รายการโปรด
                </Link>
                <Link
                  to="/bookmark-teacher"
                  className="text-purple-600 group flex items-center"
                >
                  Online Learning
                  <HiOutlineArrowLongRight className="ml-1.5 text-xl transition-transform duration-300 group-hover:translate-x-2 group-hover:-rotate-45" />
                </Link>
              </>
            )}
          </div>

          {/* User Profile (Right Aligned) */}
          <div className="ml-auto flex items-center">
            {user ? (
              <div className="relative flex items-center space-x-1">
                <Notifications />
                <NotificationBell />
                <MenuProfile />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-purple-600 font-bold"
                >
                  Google Login
                </Link>
              </div>
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
                    <button
                      onClick={toggleLessonDropdown}
                      className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                    >
                      บทเรียน
                    </button>
                    {isLessonDropdownOpen && (
                      <div className="pl-0">
                        <Link
                          to="/Biomechanical-consideration-student"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          onClick={closeMenu}
                        >
                          Biomechanical consideration
                        </Link>
                        <Link
                          to="/Possible-Movement-Of-RPD-student"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          Possible movement of RPD
                        </Link>
                        <Link
                          to="/MovementOfRPD-student"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          การเคลื่อนที่ของฟันเทียม
                        </Link>
                        {/* <Link
                          to="/home"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          RPD sample case
                        </Link> */}
                        <Link
                          to="/AR-RPD"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
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
                  <Link
                    to="/lectureHistory-student"
                    className="text-gray-800 hover:text-purple-600"
                    onClick={closeMenu}
                  >
                    ประวัติการเลกเชอร์
                  </Link>
                  <Link
                    to="/bookmark-student"
                    className="text-gray-800 hover:text-purple-600"
                    onClick={closeMenu}
                  >
                    รายการโปรด
                  </Link>
                </>
              )}

              {user?.role === "teacher" && (
                <>
                  <div className="relative">
                    <button
                      onClick={toggleLessonDropdown}
                      className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
                    >
                      บทเรียน
                    </button>
                    {isLessonDropdownOpen && (
                      <div className="pl-0">
                        <Link
                          to="/Biomechanical-consideration-teacher"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                          onClick={closeMenu}
                        >
                          Biomechanical consideration
                        </Link>
                        <Link
                          to="/Possible-Movement-Of-RPD-teacher"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          Possible movement of RPD
                        </Link>
                        <Link
                          to="/MovementOfRPD-teacher"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          การเคลื่อนที่ของฟันเทียม
                        </Link>
                        {/* <Link
                          to="/home"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          RPD sample case
                        </Link> */}
                        <Link
                          to="/AR-RPD"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          View AR
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/ListQuiz-teacher"
                    className="text-gray-800 hover:text-purple-600"
                    onClick={closeMenu}
                  >
                    แบบทดสอบ
                  </Link>
                  <Link
                    to="/lectureHistory-teacher"
                    className="text-gray-800 hover:text-purple-600"
                    onClick={closeMenu}
                  >
                    ประวัติการเลกเชอร์
                  </Link>
                  <Link
                    to="/bookmark-teacher"
                    className="text-gray-800 hover:text-purple-600"
                    onClick={closeMenu}
                  >
                    รายการโปรด
                  </Link>
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
