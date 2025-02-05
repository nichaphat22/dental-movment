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
  const { setNotificationsAsRead,markMessageAsRead } = useContext(ChatContext);

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
// ฟังก์ชัน handleClick ที่เรียกใช้งาน markMessageAsRead
const handleClick = async (id) => {
  if (!latestMessage || !id || latestMessage.isRead) return; // ตรวจสอบว่าข้อความไม่ถูกอ่านแล้ว

  try {
      await markMessageAsRead(id, latestMessage.isRead); // ส่งข้อมูลที่ต้องการไป
      setNotificationsAsRead(id); // อัปเดตสถานะการแจ้งเตือน
  } catch (error) {
      console.error("❌ Error marking message as read:", error);
  }
  navigate(`/chat/${id}`); // นำทางไปที่หน้าห้องแชท
};
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
        <LazyLoadImage src={recipientUser?.img} alt="profile"  style={{borderRadius:'50%',display: 'block',width:"40px" ,height:"40px"}} />
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
              {truncateText(latestMessage?.text)}
            </span>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date" style={{color:''}}>{moment(latestMessage?.createdAt).locale("th").calendar()}</div>
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
