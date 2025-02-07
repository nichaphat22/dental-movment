import { baseUrl, getRequest, postRequest, patchRequest } from "../../utils/services";
import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { BsChatTextFill } from "react-icons/bs";
import NotiChat from "./NotiChat";
import moment from "moment/min/moment-with-locales";
import { useNavigate } from "react-router-dom";
// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
moment.locale("th");

const Notifications = ({}) => {
  const { user } = useContext(AuthContext);  // Context to get the current user data
  const [isOpen, setIsOpen] = useState(false); // State to control visibility of the notification box
  const { unreadChatsCount,notifications,setNotifications,userChats,unreadNotifications,setUnreadNotifications,updateCurrentChat } = useContext(ChatContext);
  
  useEffect(() => {
    return () => {
        updateCurrentChat(null);
    };
}, [updateCurrentChat]);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getRequest(`${baseUrl}/messages/notifications/unread/${user?._id}`);
        const notifications = response;
        const unread = notifications?.filter(notification => !notification.isRead && notification.recipientId === user._id);
        setUnreadNotifications(unread);
        setNotifications(notifications); // อัปเดตข้อมูลใน ChatContext
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
  
    fetchNotifications();
  }, [user?._id, setNotifications,setUnreadNotifications]);  // ดึงข้อมูลใหม่ทุกครั้งที่ user._id หรือ setNotifications เปลี่ยนแปลง
  

  const handleNotificationsClick = async () => {
    try {
      // อัปเดตสถานะ isRead เป็น true เมื่อคลิกที่การแจ้งเตือน
      await patchRequest(`${baseUrl}/messages/notifications/read/${user._id}`, { isRead: true });
  
      // ปรับปรุงการแจ้งเตือนใน state หลังจากการอัปเดต
      setIsOpen(!isOpen);  // Toggle visibility of notification box
      // setUnreadNotifications([]); // ลบการแจ้งเตือนที่ยังไม่ได้อ่านจาก state
      // รีเฟรชการดึงข้อมูลใหม่
      const response = await getRequest(`${baseUrl}/messages/notifications/unread/${user._id}`);
      const notifications = response;
      const unread = notifications?.filter(notification => !notification.isRead && notification.recipientId === user._id);
      setUnreadNotifications(unread);  // อัปเดตการแจ้งเตือนใหม่
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };
  
  const UnreadChats = unreadChatsCount(notifications);
  console.log("Unread chats count:", UnreadChats);
  
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
        {UnreadChats > 0 ? (
  <div
    className="unread-count"
    style={{
      position: "absolute",
      top: "-5px",
      right: "-5px",
      background: "red",
      color: "white",
      borderRadius: "50%",
      padding: "5px",
      fontSize: "12px",
    }}
  >
    {UnreadChats}  {/* แสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน */}
  </div>
) : null}  {/* หรือถ้าไม่มีการแจ้งเตือนที่ยังไม่ได้อ่านก็จะไม่แสดง */}

      </div>

      {isOpen && (
        <div className="notifications-box" onClick={() => setIsOpen(false)}>
          <div className="notifications-header">
            <h3 style={{ color: "#000", textAlign: "center" }}>แชท</h3>
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
