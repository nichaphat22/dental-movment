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

const NotiChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const navigate = useNavigate();

  // ดึงข้อมูลจาก ChatContext
  const { notifications,setNotificationsAsRead,unreadChatsCount,markMessageAsRead } = useContext(ChatContext);

  // ดึงข้อความล่าสุด
  const { latestMessage: initialLatestMessage } = useFetchLatestMessage(chat, user);
  const [latestMessage, setLatestMessage] = useState(initialLatestMessage);

  useEffect(() => {
    setLatestMessage(initialLatestMessage);
  }, [initialLatestMessage]);

  // ฟังก์ชันสำหรับตัดข้อความให้สั้นลง
  const truncateText = text => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) {
      shortText = shortText + "...";
    }
    return shortText;
  };

  const hasUnreadMessages = latestMessage && latestMessage.senderId === recipientUser?._id && !latestMessage.isRead;

// ฟังก์ชันในการคลิกเพื่อทำให้การแจ้งเตือนเป็น "อ่านแล้ว"
// ✅ ฟังก์ชันเมื่อกดที่แชท
const handleClick = async (id) => {
  // ตรวจสอบว่า latestMessage มีค่าหรือไม่ และข้อความยังไม่ได้อ่าน|| id !== user._id
  if (!latestMessage || !id  ) {
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
      className="user-card-noti align-items-center p-2 justify-content-between"
      role="button"
      onClick={() => handleClick(recipientUser?._id)} // ส่ง chat.senderId ไปที่ handleClick
    >
      <div className="d-flex">
        <div className="me-2" style={{margin: 'auto'}}>
        <LazyLoadImage src={recipientUser?.img} alt="profile"  style={{borderRadius:'50%',display: 'block',width:"32px" ,height:"32px"}} />
        </div>
        <div className="text-content">
          <div className="name" style={{ color: "black" }}>
            {recipientUser?.fname} {recipientUser?.lname}
          </div>
          <div className="text" style={{fontSize:'12.5px'}}>
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
        {unreadMessages > 0 && (
                <span style={{ color: '#000',fontSize:'12px',fontWeight:'400' }}>
                  {unreadMessages} <span style={{color: '#000',fontSize:'12px',fontWeight:'400' }}>ข้อความใหม่</span>
                </span>
              )}
             <div className="date">
        {latestMessage ? (
          moment(latestMessage?.createdAt).locale("th").calendar()
        ) : (
          null
        )}
      </div>
          {/* Display the number of unread notifications for each chat */}
          {/* <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
                        {thisUserNotifications?.length > 0 ? thisUserNotifications.length : ""}
                    </div> */}
        {/* <span className={isOnline ? "user-online" : ""}></span> */}
      </div>
    </Stack>
  );
};

export default NotiChat;
