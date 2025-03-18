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


// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
moment.locale("th");

const Notifications = ({}) => {
  // const { user } = useContext(AuthContext);  // Context to get the current user data
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false); // State to control visibility of the notification box
  const { setNotifications,userChats,unreadNotifications,setUnreadNotifications,updateCurrentChat } = useContext(ChatContext);
  
  useEffect(() => {
    return () => {
        updateCurrentChat(null);
    };
}, [updateCurrentChat]);
  
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/messages/notifications/unread/${user?._id}`);
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
    // console.error("id", id);
    try {
      // อัปเดตสถานะ isRead เป็น true เมื่อคลิกที่การแจ้งเตือน
      await axios.patch(`/api/messages/notifications/read/${user._id}`, { isRead: true });
  
      // ปรับปรุงการแจ้งเตือนใน state หลังจากการอัปเดต
      setIsOpen(!isOpen);  // Toggle visibility of notification box
      // setUnreadNotifications([]); // ลบการแจ้งเตือนที่ยังไม่ได้อ่านจาก state
      // รีเฟรชการดึงข้อมูลใหม่
      const response = await axios.get(`/api/messages/notifications/unread/${user._id}`);
      const notifications = response.data; 
      const unread = notifications?.filter(notification => !notification.isRead && notification.recipientId === user._id);
      setUnreadNotifications(unread);  // อัปเดตการแจ้งเตือนใหม่
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };
  
  
  
  return (
    <div className="notifications">
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
        // onClick={handleNotificationsClick}
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
      // fontSize: "24px",
      width:'12px',
      height:'12px'
    }}
  >
  </div>
)}

      </div>

      {isOpen && (
        <div className="notifications-box" onClick={() => setIsOpen(false)}>
          <div className="notifications-header">
            <h3 style={{ color: "#000", textAlign: "center",fontSize:'16px' }}>แชท</h3>
          </div>

          {userChats?.length > 0 ? (
            <Stack className="messages-box flex-grow-0" gap={3}>
              {userChats.map((chat) => (
                <div key={chat._id} onClick={() => updateCurrentChat(chat)}>
                  <NotiChat chat={chat} user={user} />
                </div>
              ))}
            </Stack>
          ) : (
            <p>No chats available</p>  // If no chats are available
          )}
        </div>
      )}
    </div>
  );
};


export default Notifications;
