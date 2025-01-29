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
  } = useContext(ChatContext);

  // Reset CurrentChat เมื่อปิด Notifications
  useEffect(() => {
    return () => {
      updateCurrentChat(null);
    };
  }, [updateCurrentChat]);

  useEffect(() => {
    // กรองการแจ้งเตือนที่ยังไม่ได้อ่านและ recipientId ตรงกับ user._id
    const unreadNotifications = notifications?.filter(
      (notification) => notification.senderId != user._id && !notification.isRead
    ) || [];
  
    setUnreadCount(unreadNotifications.length);  // อัปเดตจำนวนที่ยังไม่ได้อ่าน
  }, [notifications, user._id]);  // คำนวณใหม่เมื่อ notifications หรือ user._id เปลี่ยนแปลง
  

  const handleNotificationsClick = () => {
    setIsOpen(!isOpen);
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
