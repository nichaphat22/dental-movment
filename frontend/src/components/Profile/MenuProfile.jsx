import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { API } from "../../api/api";
import { logout } from "../../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { GoPencil } from "react-icons/go";
import { IoLogOutOutline } from "react-icons/io5";
import CustomizeProfile from "./CustomizeProfile";

const MenuProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const img = useSelector((state) => state.auth.img);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleProfileModal = () => setIsProfileOpen(!isProfileOpen);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await API.get("/api/auth/logout");
      dispatch(logout());
      navigate("/login"); // Redirect after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  return (
    <div className="relative" style={{zIndex:51}}  ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 transition"
      >
        <img src={img} alt="Profile" className="w-8 h-8 rounded-full hover:transform-none" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 shadow-lg rounded-xl z-50"
          >
            <div className="w-full h-16  p-2 border-b">
              <div className="flex">
                <div className="w-12 h-12 mr-3 flex-shrink-0  flex items-center justify-center">
                  <img
                    src={img}
                    alt="Profile"
                    className="w-10 h-10 rounded-full hover:transform-none shadow-none"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-base ">{user?.name}</p>
                  <p className="text-xs md:text-xs">{user?.email}</p>
                </div>
              </div>
              {/* <div 
                onClick={toggleProfileModal}
                className="-mx-2 flex space-x-2 hover:bg-gray-100 mt-2.5 cursor-pointer px-2 py-1"
              
              >
                <GoPencil className="w-3.5 h-3.5 ml-2" />
                <p className="text-xs ">Customize profile</p>
                
              </div> */}
            </div>
            <div
              onClick={handleLogout}
              className="flex space-x-2 p-2 border-b hover:bg-gray-100 hover:rounded-b-lg cursor-pointer"
            >
              <IoLogOutOutline className="w-4 h-4 ml-2" />
              <p className="text-xs ">ออกจากระบบ</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CustomizeProfile isOpen={isProfileOpen} onClose={toggleProfileModal}/>
    </div>
  );
};

export default MenuProfile;

// <div className='bg-white p-2 w-24 shadow-sm absolute right-3 border-none rounded-md'>
//       <ul>
//         {ProfileMenu.map((menu) => (
//           <li
//             className='p-2 text-md cursor-pointer hover:bg-violet-100 rounded-lg'
//             key={menu}
//             onClick={() => handleMenuClick(menu)}
//           >
//             {menu}
//           </li>
//         ))}
//       </ul>
//     </div>
