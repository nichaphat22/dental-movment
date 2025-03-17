// import { baseUrl, getRequest, postRequest, patchRequest } from "../../utils/services";
import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { BsChatTextFill } from "react-icons/bs";
import NotiChat from "./NotiChat";
import moment from "moment/min/moment-with-locales";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoChatboxEllipses } from "react-icons/io5";

// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
moment.locale("th");

const Notifications = ({}) => {
  const { user } = useContext(AuthContext);  // Context to get the current user data
  const [isOpen, setIsOpen] = useState(false); // State to control visibility of the notification box
  const { setActiveChatId,setNotifications,userChats,unreadNotifications,setUnreadNotifications,updateCurrentChat } = useContext(ChatContext);
  
//   useEffect(() => {
//     return () => {
//         updateCurrentChat(null);
//     };
// }, [updateCurrentChat]);

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
      const response = await axios.get(`http://localhost:8080/api/messages/notifications/unread/${user?._id}`);
      const notifications = response.data;  // เข้าถึงข้อมูลในโปรเปอร์ตี้ data ของ response
      const unread = notifications?.filter(notification => !notification.isRead && notification.recipientId === user._id);
      setUnreadNotifications(unread);
      setNotifications(notifications); // อัปเดตข้อมูลการแจ้งเตือนใน ChatContext
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  fetchNotifications();
}, [user?._id, setNotifications, setUnreadNotifications]);


  const handleNotificationsClick = async () => {
    // console.error("id", id);
    try {
      // อัปเดตสถานะ isRead เป็น true เมื่อคลิกที่การแจ้งเตือน
      await axios.patch(`http://localhost:8080/api/messages/notifications/read/${user._id}`, { isRead: true });

       // ลบการแจ้งเตือนที่อ่านแล้วจากฐานข้อมูล
       await axios.delete(`http://localhost:8080/api/messages/notifications/DeleteUserRead/${user._id}`);
  
      // ปรับปรุงการแจ้งเตือนใน state หลังจากการอัปเดต
      setIsOpen(!isOpen);  // Toggle visibility of notification box
      // setUnreadNotifications([]); // ลบการแจ้งเตือนที่ยังไม่ได้อ่านจาก state
      // รีเฟรชการดึงข้อมูลใหม่
      const response = await axios.get(`http://localhost:8080/api/messages/notifications/unread/${user._id}`);
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
             <div className="" style={{color:'#000',justifyContent:'center',textAlign:'center',fontWeight:'400',fontSize:'18px',display:'inline-flex',alignItems:'center',marginBottom:'5px'}}><span style={{fontWeight:'400',marginRight:'5px',fontSize:'18px'}}>แชต</span> <span style={{color:'rgb(175, 131, 255)'}}><IoChatboxEllipses size={20} />
                            </span></div>
            {/* <h3 style={{ color: "#000", textAlign: "center",fontSize:'16px' }}>แชท</h3> */}
          </div>

          {userChats?.length > 0 ? (
            <Stack className="messages-box flex-grow-0" gap={0} style={{background:'#fff',borderRadius:''}}>
              {userChats.map((chat) => (
                <div key={chat._id} onClick={() => handleChatClick(chat)}>
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
