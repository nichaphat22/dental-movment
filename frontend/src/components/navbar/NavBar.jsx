import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { API } from '../../api/api';
import { logoutUser } from "../../redux/authSlice";
import { AuthContext } from "../../context/AuthContext";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiSearch,
  HiOutlineBell,
} from "react-icons/hi";
import GoogleLogin from "../GoogleLoginButton";
import MenuProfile from "../Profile/MenuProfile";
import NotificationBell from "../Notification/NotificationBell";
import "../../tailwind.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  const { user, logoutUser, loginWithGoogle } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // // Refs สำหรับการตรวจจับการคลิกข้างนอก
  // const notificationRef = useRef(null);
  // const profileRef = useRef(null);

  // // ฟังก์ชันตรวจจับการคลิกข้างนอก
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       notificationRef.current &&
  //       !notificationRef.current.contains(event.target)
  //     ) {
  //       setIsNotificationOpen(false);
  //     }
  //     if (profileRef.current && !profileRef.current.contains(event.target)) {
  //       setOpenProfile(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);


  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleLessonDropdown = () => {
    setIsLessonDropdownOpen(!isLessonDropdownOpen);
  };

  // Menu Profile

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-2 px-6">
        {/* Mobile Menu Icon */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Menu Toggle Button */}
          <button onClick={toggleMenu}>
            {isOpen ? (
              <HiOutlineX className="text-3xl text-purple-600" />
            ) : (
              <HiOutlineMenu className="text-3xl text-purple-600" />
            )}
          </button>
          {/* Logo */}
          <div className="text-2xl font-bold text-purple-600">
            <Link to="/dashboard">
              <img
                src="https://upload.wikimedia.org/wikipedia/th/thumb/1/19/DENTISTRY_KKU.svg/800px-DENTISTRY_KKU.svg.png"
                alt="Logo"
                width="50"
                height="50"
              />
            </Link>
          </div>
        </div>

        {/* Manu phon & ipad  */}
        <div className="lg:hidden flex items-center space-x-4">
          {user ? (
            <div className="relative flex items-center">
              {/* แจ้งเตือน */}

              <NotificationBell />

              {/* Profile */}
              <button onClick={() => setOpenProfile(!openProfile)}>
                <img
                  src={user?.img}
                  alt=""
                  width="38"
                  height="38"
                  className="rounded-full cursor-pointer"
                />
                {openProfile && <MenuProfile />}
              </button>
            </div>
          ) : (
            // If user is not logged in, show GoogleLogin and Login link
            <div className="flex items-center space-x-4">
              <GoogleLogin onLoginSuccess={loginWithGoogle} />
              <Link to="/login" className="text-gray-800 hover:text-purple-600">
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex space-x-4 items-center">
          <Link to="/dashboard">
            <img
              src="https://upload.wikimedia.org/wikipedia/th/thumb/1/19/DENTISTRY_KKU.svg/800px-DENTISTRY_KKU.svg.png"
              alt="Logo"
              width="50"
              height="50"
            />
          </Link>
          <Link
            to="/lesson"
            className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
          >
            บทเรียน
          </Link>
          <Link
            to="/ListQuiz"
            className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
          >
            แบบทดสอบ
          </Link>
          <Link
            to="/lectureHistory"
            className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
          >
            ประวัติการเลกเชอร์
          </Link>
          <Link
            to="/bookmark"
            className="text-gray-800 hover:text-purple-600 focus:text-purple-600"
          >
            รายการโปรด
          </Link>
          {/* <Link to="/Form" className="text-gray-800 hover:text-purple-600 focus:text-purple-600">เพิ่มรายชื่อนักศึกษา</Link> */}
        </div>
        <div className="hidden lg:flex space-x-4 items-center">
          {/* Search & User Options */}
          {user && (
            <div className="hidden lg:flex ml-auto justify-end  items-center space-x-4">
              {/* notification */}

              <NotificationBell />

              {/* <button onClick={logoutUser} className="text-gray-800 hover:text-purple-600">Logout</button> */}
              <button onClick={() => setOpenProfile(!openProfile)}>
                <img
                  src={user?.img}
                  alt=""
                  width="38"
                  height="38"
                  className="rounded-full"
                />
                {openProfile && <MenuProfile />}
              </button>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-4">
              <GoogleLogin onLoginSuccess={loginWithGoogle} />
              <Link to="/login" className="text-gray-800 hover:text-purple-600">
                Login
              </Link>
            </div>
          )}
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
                <Link to="/dashboard"  onClick={closeMenu}>
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
                      to="/Biomechanical-consideration"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:text-purple-600"
                      onClick={closeMenu}
                    >
                      Biomechanical consideration
                    </Link>
                    <Link
                      to="/home"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Possible movement of RPD
                    </Link>
                    <Link
                      to="/MovementOfRPD"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      การเคลื่อนที่ของฟันเทียม
                    </Link>
                    <Link
                      to="/home"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      RPD sample case
                    </Link>
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
                to="/ListQuiz"
                className="text-gray-800 hover:text-purple-600"
                onClick={closeMenu}
              >
                แบบทดสอบ
              </Link>
              <Link
                to="/lectureHistory"
                className="text-gray-800 hover:text-purple-600"
                onClick={closeMenu}
              >
                ประวัติการเลกเชอร์
              </Link>
              <Link
                to="/bookmark"
                className="text-gray-800 hover:text-purple-600"
                onClick={closeMenu}
              >
                รายการโปรด
              </Link>
              {/* <Link to="/Form" className="text-gray-800 hover:text-purple-600"onClick={closeMenu}>เพิ่มรายชื่อนักศึกษา</Link> */}

              {user && (
                <>
                  {/* <Link onClick={logoutUser} className="text-gray-800 hover:text-purple-600">Logout</Link> */}
                  {/* <Link to="/profile" className="text-gray-800 hover:text-purple-600"onClick={closeMenu}>Profile</Link> */}
                </>
              )}

              {!user && (
                <>
                  {/* <GoogleLogin /> */}
                  {/* <Link to="/login" className="text-gray-800 hover:text-purple-600">Login</Link> */}
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
