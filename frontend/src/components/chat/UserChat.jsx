import { baseUrl, patchRequest } from "../../utils/services"; 
import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from 'moment/min/moment-with-locales';
import { LazyLoadImage } from 'react-lazy-load-image-component';

moment.locale('th'); // ตั้งค่าเป็นภาษาไทย

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const navigate = useNavigate();

  // ดึงข้อมูลจาก ChatContext
  const { setNotificationsAsRead } = useContext(ChatContext);

  // ดึงข้อความล่าสุด
  const { latestMessage: initialLatestMessage } = useFetchLatestMessage(chat, user);
  const [latestMessage, setLatestMessage] = useState(initialLatestMessage);
  // console.log("user:", user);
  useEffect(() => {
    setLatestMessage(initialLatestMessage);
  }, [initialLatestMessage]);

  // ตรวจสอบว่ามีข้อความที่ยังไม่ได้อ่าน
  const hasUnreadMessages = latestMessage && latestMessage.senderId === recipientUser?._id && !latestMessage.isRead;

  // ✅ ฟังก์ชัน markMessageAsRead (ย้ายมาอยู่ใน UserChat)
  const markMessageAsRead = async (senderId, isRead) => { 
    if (!senderId || isRead) {
      console.log('Skipping update for senderId:', senderId);
      return;
    }
    

    try {
      const response = await patchRequest(`${baseUrl}/messages/read/${senderId}`, { isRead: true });

      if (response.success) {
        console.log("Message marked as read:", response);
        
        // ✅ อัปเดต UI ให้เป็นตัวบางแบบเรียลไทม์
        setLatestMessage(prev => prev ? { ...prev, isRead: true } : prev);
      } else {
        console.warn("Failed to update message read status");
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // ✅ ฟังก์ชันเมื่อกดที่แชท
  const handleClick = async (id) => {
    if (latestMessage) {
      await markMessageAsRead(id, latestMessage.isRead);
    }

    setNotificationsAsRead(id);
    navigate(`/chat/${id}`);
  };

  return (
    <Stack
      direction="horizontal"
      gap={1}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
      onClick={() => handleClick(recipientUser?._id)} 
    >
      <div className="d-flex">
        <div className="me-2" style={{ margin: 'auto' }}>
          <LazyLoadImage 
            src={recipientUser?.img} 
            alt="profile" 
            style={{ borderRadius: '50%', display: 'block', width: "45px", height: "45px" }} 
          />
        </div>
        <div className="text-content">
          <div className="name" style={{ color: "black" }}>
            {recipientUser?.fname} {recipientUser?.lname}
          </div>
          <div className="text">
            {latestMessage?.text && (
              <span
                style={{
                  fontWeight: hasUnreadMessages ? "bold" : "normal", 
                  color: hasUnreadMessages ? "#000" : "#888",
                }}
              >
                {latestMessage?.text.length > 20 ? latestMessage?.text.substring(0, 20) + "..." : latestMessage?.text}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">
          {moment(latestMessage?.createdAt).locale("th").calendar()}
        </div>
      </div>
    </Stack>
  );
};

export default UserChat;
