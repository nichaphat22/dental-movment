import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import { Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import moment from 'moment/min/moment-with-locales';
import { LazyLoadImage } from 'react-lazy-load-image-component';

moment.locale('th');

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const navigate = useNavigate();

  // ✅ ดึงฟังก์ชัน markMessageAsRead จาก ChatContext
  const { notifications,markMessageAsRead, setNotificationsAsRead, unreadChatsCount,socket } = useContext(ChatContext);

  // ดึงข้อความล่าสุด
  const { latestMessage: initialLatestMessage } = useFetchLatestMessage(chat, user);
  const [latestMessage, setLatestMessage] = useState(initialLatestMessage);

  useEffect(() => {
    setLatestMessage(initialLatestMessage);
  }, [initialLatestMessage]);

  const hasUnreadMessages = latestMessage && latestMessage.senderId === recipientUser?._id && !latestMessage.isRead;

  
console.log('chat',chat._id)

// const unreadMessages = unreadMessageCount(messages);


  // ✅ ฟังก์ชันเมื่อกดที่แชท
 // ✅ ฟังก์ชันเมื่อกดที่แชท
const handleClick = async (id) => {
    // ตรวจสอบว่า latestMessage มีค่าหรือไม่ และข้อความยังไม่ได้อ่าน|| id !== user._id
    if (!latestMessage || !id || latestMessage.isRead || latestMessage.senderId === user._id  ) {
        // ถ้าข้อความถูกอ่านแล้ว หรือไม่มี latestMessage ก็ไม่ต้องทำอะไร
        console.log("Message is already read or latestMessage is undefined.");
        return;
    }

    try {
        // เรียกใช้งาน markMessageAsRead เพื่ออัปเดตสถานะการอ่าน
        console.log("Marking message as read for sender:", id);
        await markMessageAsRead(id, latestMessage.isRead);

        // อัปเดตการแจ้งเตือนเมื่อข้อความถูกอ่านแล้ว
        setNotificationsAsRead(id);
         // ✅ ตรวจสอบว่ามีการเชื่อมต่อ socket ก่อนใช้
        
    } catch (error) {
        console.error("❌ Error marking message as read:", error);
    }
    
    // นำทางไปยังหน้าของแชท
    navigate(`/chat/${id}`);
};
const unreadMessages = unreadChatsCount(notifications, recipientUser?._id);


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
            {/* {recipientUser?.fname} {recipientUser?.lname} */}
            {recipientUser?.name}
          </div>
          <div className="text">
  {latestMessage && (
    <span
      style={{
        fontWeight: hasUnreadMessages ? "bold" : "normal",
        color: hasUnreadMessages ? "#000" : "#888",
      }}
    >
      {latestMessage?.file ? (
        latestMessage?.file?.type.includes("image")
          ? "ส่งรูปภาพ"
          : "ส่งไฟล์"
      ) : (
        latestMessage?.text?.length > 20
          ? latestMessage?.text.substring(0, 20) + "..."
          : latestMessage?.text
      )}
    </span>
  )}
</div>


        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        {/* ✅ แสดงเฉพาะถ้าจำนวนข้อความที่ยังไม่ได้อ่านมากกว่า 0 */}
        {unreadMessages > 0 && (
          <span style={{ color: '#000',fontSize:'14px',fontWeight:'400' }}>
            {unreadMessages} <span style={{color: '#000',fontSize:'14px',fontWeight:'400' }}>ข้อความใหม่</span>
          </span>
        )}
       <div className="date">
  {latestMessage ? (
    moment(latestMessage?.createdAt).locale("th").calendar()
  ) : (
    null
  )}
</div>

      </div>
    </Stack>
  );
};

export default UserChat;
