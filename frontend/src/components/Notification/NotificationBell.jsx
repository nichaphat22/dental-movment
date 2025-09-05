import React, { useEffect, useState, useRef, useCallback } from "react";
import socket from "../../utils/socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";

import { useDispatch, useSelector } from "react-redux";
import {
  setNotifications,
  addNotification,
  markAsReadReducer,
  deleteNotificationReducer,
} from "../../redux/notificationSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaTrash } from "react-icons/fa";
// import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification as deleteNotificationAPI,
} from "../../utils/notificationAPI";

const token = localStorage.getItem("token");

dayjs.extend(relativeTime);
dayjs.locale("th");

function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount } = useSelector((state) => state.notifications);
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // ดึงการแจ้งเตือนจากเซิร์ฟเวอร์
    getUserNotifications()
      .then((data) => {
        console.log("🔹 Notifications fetched:", data);
        dispatch(setNotifications(data));
      })
      .catch((error) => {
        console.error("❌ Error fetching notifications:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (user && !socket.connected) {
      socket.connect();
      console.log("✅ Socket connected:", socket.id);
      console.log("🔍 WebSocket connected:", socket.connected);
      socket.emit("addNewUser", { userId: user._id });
    } else if (!user) {
      socket.disconnect();
      console.log("❌ Socket disconnected");
    }

    const handleNewNotification = (notification) => {
      console.log("📩 Received notification:", notification);
      if (notification?.message) {
        // toast.info(notification.message);
        dispatch(addNotification(notification));
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.disconnect();
    };
  }, [dispatch, user]);

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

  const handleRead = useCallback(
    async (notificationIds, link) => {
      try {
        console.log(`✅ Marking notification as read: ${notificationIds}`);
        await markNotificationsAsRead(notificationIds);
        dispatch(markAsReadReducer(notificationIds));
        navigate(link || "/default");
      } catch (error) {
        console.error("❌ Error marking notification as read:", error);
      }
    },
    [dispatch, navigate]
  );

  const handleDelete = useCallback(
    async (notificationId) => {
      try {
        if (!user?._id) {
          toast.error("❌ You must be logged in to delete notifications.");
          return;
        }

        const notification = list.find((n) => n._id === notificationId);
        if (!notification || notification.recipient !== user._id) {
          return;
        }

        console.log("🔹 Deleting notification ID:", notificationId);

        await deleteNotificationAPI(notificationId);
        dispatch(deleteNotificationReducer(notificationId));
      } catch (error) {
        console.error("❌ Error deleting notification:", error);
      }
    },
    [dispatch, list, user]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 transition"
      >
        <FaBell className="text-purple-500 w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-2 sm:right-0 mt-3 w-[20vw]  bg-white border border-gray-200 shadow-lg rounded-xl z-50"
          >
            <div className="p-2.5 border-b">
              <h4 className="sm:text-base lg:text-lg text-center font-semibold text-gray-700">
                การแจ้งเตือน
              </h4>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {list.length === 0 ? (
                <p className="sm:text-xs lg:text-base text-center p-4 text-gray-500">
                  ไม่มีการแจ้งเตือน
                </p>
              ) : (
                list.map((n) => {
                  const created = dayjs(n.createdAt);
                  const now = dayjs();
                  const diffInDays = now.diff(created, "day");

                  return (
                    <motion.div
                      key={n._id}
                      className="p-3 flex justify-between items-start gap-2 border-b hover:bg-gray-100 transition"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex-1 ">
                        <p
                          onClick={() => handleRead(n._id, n.link)}
                          className="cursor-pointer text-sm hover:text-blue-500 break-words"
                        >
                          {n.message}
                        </p>
                        <span className="block text-xs text-gray-400 mt-2">
                          {diffInDays >= 3
                            ? created.format("DD/MM/YYYY HH:mm") // ถ้าเกิน 3 วัน → แสดงวันที่
                            : created.fromNow()}{" "}
                        </span>
                      </div>

                      <FaTrash
                        onClick={() => handleDelete(n._id)}
                        className="text-red-500 cursor-pointer hover:text-red-700 flex-shrink-0 mt-1"
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
