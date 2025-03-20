// import { baseUrl, getRequest, postRequest, patchRequest } from "../../utils/services";
import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { BsChatTextFill } from "react-icons/bs";
import NotiChat from "./NotiChat";
import moment from "moment/min/moment-with-locales";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoChatboxEllipses } from "react-icons/io5";
import { baseUrl } from "../../utils/services";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
moment.locale("th");

const Notifications = ({}) => {
  // const { user } = useContext(AuthContext);  // Context to get the current user data
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false); // State to control visibility of the notification box
  const { setActiveChatId,setNotifications,userChats,unreadNotifications,setUnreadNotifications,updateCurrentChat } = useContext(ChatContext);
  
  // ใช้ useRef เพื่ออ้างอิงกล่อง notifications
  const notificationsRef = useRef(null);

  useEffect(() => {
    // ฟังก์ชันตรวจจับการคลิกนอกกล่อง
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsOpen(false); // ปิดกล่อง notifications ถ้าคลิกนอกกล่อง
      }
    };

    // เพิ่ม event listener เมื่อ component ถูก mount
    document.addEventListener("mousedown", handleClickOutside);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

const handleChatClick = (chat) => {
  try {
    setActiveChatId(chat._id);  // Set the active chat
    updateCurrentChat(chat);  // Update current chat in context
  } catch (error) {
    console.error("Error updating active chat:", error);
  }
};

  
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${baseUrl}/messages/notifications/unread/${user?._id}`);
      const notifications = response.data;  // เข้าถึงข้อมูลในโปรเปอร์ตี้ data ของ response
      const unread = notifications?.filter(notification => !notification.isRead && notification.recipientId === user._id);
      setUnreadNotifications(unread);
      setNotifications(notifications); // อัปเดตข้อมูลการแจ้งเตือนใน ChatContext
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  if (user?._id) {
    fetchNotifications();
  }
}, [user?._id, setNotifications, setUnreadNotifications]);


const handleNotificationsClick = async () => {
  try {
    // ✅ ดึง Notification ก่อน เพื่อเช็คว่ามีอยู่หรือไม่
    const response = await axios.get(`${baseUrl}/messages/notifications/unread/${user._id}`);
    const notifications = response.data; 

    // ✅ เปิด/ปิดกล่อง Notification ทุกครั้ง
    setIsOpen(!isOpen);

    if (!notifications || notifications.length === 0) {
      console.log("No notifications found, skipping update and delete.");
      return;  // ถ้าไม่มี Notification ให้หยุดทำงานแค่ส่วนอัปเดต
    }

    // ✅ PATCH: อัปเดตสถานะ isRead เป็น true
    await axios.patch(`${baseUrl}/messages/notifications/read/${user._id}`, { isRead: true });

    // ✅ DELETE: ลบเฉพาะ Notification ที่ isRead = true
    console.log(`Deleting notifications for user ID: ${user._id}`);
    await axios.delete(`${baseUrl}/messages/notifications/DeleteUserRead/${user._id}`);
    
    // ✅ รีเฟรชข้อมูลใหม่
    const updatedResponse = await axios.get(`${baseUrl}/messages/notifications/unread/${user._id}`);
    const updatedNotifications = updatedResponse.data; 
    const unread = updatedNotifications?.filter(notification => !notification.isRead && notification.recipientId === user._id);
    setUnreadNotifications(unread);  

  } catch (error) {
    console.error("Error updating notification:", error);
  }
};

  
  
return (
  <div className="notifications" style={{ zIndex: 51 }}>
    <div
      className="notifications-icon"
      style={{
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        color: "rgb(169, 85, 247)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(241, 241, 241, 0.7)",
        border: "none",
        cursor: "pointer",
      }}
      onClick={() => handleNotificationsClick()}
    >
      <BsChatTextFill size={20} />
      {unreadNotifications.length > 0 && (
        <div
          className="unread-count"
          style={{
            position: "absolute",
            top: "0",
            right: "-5px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "5px",
            width: "12px",
            height: "12px",
          }}
        />
      )}
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-3 bg-white border border-gray-200 shadow-lg rounded-xl z-50"
          ref={notificationsRef} // อ้างอิงถึงกล่อง notifications
        >
          <div className="notifications-box" onClick={() => setIsOpen(false)}>
            <div className="notifications-header">
              <div
                className=""
                style={{
                  color: "#000",
                  justifyContent: "center",
                  textAlign: "center",
                  fontWeight: "400",
                  fontSize: "18px",
                  display: "inline-flex",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontWeight: "400", marginRight: "5px", fontSize: "18px" }}>
                  แชต
                </span>{" "}
                <span style={{ color: "rgb(175, 131, 255)" }}>
                  <IoChatboxEllipses size={20} />
                </span>
              </div>
            </div>

            {userChats?.length > 0 ? (
              <Stack className="messages-box flex-grow-0" gap={0} style={{ background: "#fff" }}>
                {userChats.map((chat) => (
                  <div key={chat._id} onClick={() => handleChatClick(chat)}>
                    <NotiChat chat={chat} user={user} />
                  </div>
                ))}
              </Stack>
            ) : (
              <p>No chats available</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};

export default Notifications;