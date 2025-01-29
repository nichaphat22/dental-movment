import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";
import { BsChatTextFill } from "react-icons/bs";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import NotiChat from "./NotiChat";
import moment from "moment/min/moment-with-locales";

moment.locale("th");

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);  // State for unread count
  // const { recipientUser } = useFetchRecipientUser(chat, user);
  // ดึงข้อมูลและฟังก์ชันจาก ChatContext
  const {
    userChats,
    notifications,  // Assuming this will hold all notifications
    updateCurrentChat,
    setNotifications
     
  } = useContext(ChatContext);

  // Reset CurrentChat เมื่อปิด Notifications
  useEffect(() => {
    return () => {
      updateCurrentChat(null);
    };
  }, [updateCurrentChat]);


  useEffect(() => {
    // ดึงการแจ้งเตือนที่ยังไม่ได้อ่านจาก localStorage
    const unreadNotifications = JSON.parse(localStorage.getItem("unreadNotifications")) || [];

    if (unreadNotifications.length > 0) {
        setNotifications(unreadNotifications);
    }
}, []);

useEffect(() => {
  if (!notifications) return;

  // ตรวจสอบการแจ้งเตือนที่ยังไม่ได้อ่านจาก notifications
  const unreadNotifications = notifications.filter(
    (notification) => notification.senderId !== user._id && !notification.isRead
  );

  // อัปเดตจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
  setUnreadCount(unreadNotifications.length);

  // บันทึกการแจ้งเตือนที่ยังไม่ได้อ่านและจำนวนการแจ้งเตือนลงใน localStorage
  localStorage.setItem('unreadNotifications', JSON.stringify(unreadNotifications));
  localStorage.setItem('unreadCount', unreadNotifications.length);
}, [notifications, user._id]); // คำนวณใหม่ทุกครั้งที่ notifications หรือ user._id เปลี่ยนแปลง

  const handleNotificationsClick = () => {
    setIsOpen(!isOpen);
    
    // รีเซ็ต notifications เป็น 0
    setNotifications([]);  // รีเซ็ตการแจ้งเตือนให้เป็นอาเรย์ว่าง
    
    // รีเซ็ตจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    setUnreadCount(0);
    
    // รีเซ็ตการแจ้งเตือนใน localStorage
    localStorage.setItem('unreadCount', '0');  // บันทึก 0 ใน localStorage เพื่อเก็บค่าใหม่
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
        onClick={handleNotificationsClick}
      >
        <BsChatTextFill size={20} />
        {unreadCount > 0 && (
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
            {unreadCount}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="notifications-box" onClick={() => setIsOpen(false)}>
          <div className="notifications-header">
            <h3 style={{ color: "#000", textAlign: "center" }}>แชท</h3>
          </div>

          {userChats?.length > 0 ? (
            <Stack className="messages-box flex-grow-0" gap={3}>
              {userChats.map((chat, index) => (
                <div key={index} onClick={() => updateCurrentChat(chat)}>
                  <NotiChat chat={chat} user={user} />
                </div>
              ))}
            </Stack>
          ) : (
            <p>No chats available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
