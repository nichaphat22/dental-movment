import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setNotifications,
  addNotification,
  markAsReadReducer,
  deleteNotificationReducer,
} from "../../redux/notificationSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaTrash } from "react-icons/fa";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification as deleteNotificationAPI,
} from "../../utils/notificationAPI";

// ตั้งค่า WebSocket
const socket = io("http://localhost:8800");

function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // ดึงการแจ้งเตือนจากเซิร์ฟเวอร์
    getNotifications()
      .then((data) => dispatch(setNotifications(data)))
      .catch((error) => console.error("Error loading notifications:", error));

    // ฟัง event "newNotification" จาก WebSocket
    socket.on("newNotification", (notification) => {
      if (notification.type === "quiz_added") {
        toast.success(`📢 ${notification.message}`, { autoClose: 3000 });
      } else {
        toast.info(notification.message);
      }
      dispatch(addNotification(notification));
    });

    // Clean up เมื่อคอมโพเนนต์ unmount
    return () => {
      socket.off("newNotification");
    };
  }, [dispatch]);

  // ตรวจจับการคลิกภายนอก dropdown
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

  // เมื่อคลิกที่การแจ้งเตือน
  const handleRead = async (id, link) => {
    try {
      // อัปเดตสถานะการอ่านการแจ้งเตือน
      await markNotificationAsRead(id);
      dispatch(markAsReadReducer(id));

      // นำทางไปที่ลิงก์ที่เกี่ยวข้อง
      if (link) {
        navigate(link);
      } else {
        navigate("/default"); // ถ้าไม่มี link ก็ไปหน้า default
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ลบการแจ้งเตือน
  const handleDelete = async (id) => {
    try {
      await deleteNotificationAPI(id);
      dispatch(deleteNotificationReducer(id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2  rounded-full hover:bg-gray-200 transition"
      >
        <FaBell className="text-purple-500 w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown แจ้งเตือน */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 shadow-lg rounded-xl z-50"
          >
            <div className="p-4 border-b">
              <h4 className="text-lg font-semibold text-gray-700">
                การแจ้งเตือน
              </h4>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {list.length === 0 ? (
                <p className="text-center p-3 text-gray-500">
                  ไม่มีการแจ้งเตือน
                </p>
              ) : (
                list.map((n) => (
                  <motion.div
                    key={n._id} // ใช้ key ที่ไม่ซ้ำ
                    className="p-3 flex justify-between items-center border-b hover:bg-gray-100 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p
                      onClick={() => handleRead(n._id, n.link)}
                      className="cursor-pointer text-sm hover:text-blue-500"
                    >
                      {n.message}
                    </p>
                    <FaTrash
                      onClick={() => handleDelete(n._id)}
                      className="text-red-500 cursor-pointer hover:text-red-700"
                    />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default NotificationBell;
