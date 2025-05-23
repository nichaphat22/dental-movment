// import { baseUrl, patchRequest } from "../../utils/services"; 
import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from 'moment/min/moment-with-locales';
import { LazyLoadImage } from 'react-lazy-load-image-component';

moment.locale('th'); // ตั้งค่าเป็นภาษาไทย

const NotiChat = ({ chat, user,isActive }) => {
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
  // console.error("id", id);
  // ตรวจสอบว่า latestMessage มีค่าหรือไม่ และข้อความยังไม่ได้อ่าน|| id !== user._id
  // if (!latestMessage || !id  ) {
  if (!id  ) {
      // ถ้าข้อความถูกอ่านแล้ว หรือไม่มี latestMessage ก็ไม่ต้องทำอะไร
      console.log("Message is already read or latestMessage is undefined.");
      return;
  }

  // try {
  //     // เรียกใช้งาน markMessageAsRead เพื่ออัปเดตสถานะการอ่าน
  //     console.log("Marking message as read for sender:", id);
  //     await markMessageAsRead(id, latestMessage.isRead);

  //     // อัปเดตการแจ้งเตือนเมื่อข้อความถูกอ่านแล้ว
  //     setNotificationsAsRead(id);
  // } catch (error) {
  //     console.error("❌ Error marking message as read:", error);
  // }
  try {
    // ตรวจสอบว่า latestMessage และ chat มีค่าหรือไม่
    if (!latestMessage || typeof latestMessage.isRead === "undefined") {
        console.log("latestMessage is undefined or isRead is undefined, skipping marking message as read.");
        
        // ตรวจสอบว่า chat และ chat._id มีค่าก่อนนำทาง
        if (chat && chat._id) {
            navigate(`/chat/${chat._id}`);
        }
        return; // ออกจากฟังก์ชันเพื่อป้องกันการรันโค้ดถัดไป
    }

    // เรียกใช้งาน markMessageAsRead เพื่ออัปเดตสถานะการอ่าน
    await markMessageAsRead(id, latestMessage.isRead);

    // อัปเดตการแจ้งเตือนเมื่อข้อความถูกอ่านแล้ว
    setNotificationsAsRead(id);
} catch (error) {
    console.error("❌ Error marking message as read:", error);
}

// ตรวจสอบอีกครั้งว่า chat มีค่า และ _id ไม่เป็น undefined ก่อนนำทาง
if (chat && chat._id) {
    navigate(`/chat/${chat._id}`);
}


};
// console.log('chat',chat._id)

const unreadMessages = unreadChatsCount(notifications, recipientUser?._id);

  return (
    <Stack
      direction="horizontal"
      gap={1}
      className={` user-card-noti align-items-center p-2 justify-content-between ${isActive ? "active-chat" : ""}`}
      role="button"
      onClick={() => handleClick(recipientUser?._id)} // ส่ง chat.senderId ไปที่ handleClick
    >
      <div className="d-flex">
        <div className="me-2" style={{margin: 'auto'}}>
        <LazyLoadImage src={recipientUser?.img} alt="profile"  style={{borderRadius:'50%',display: 'block',width:"32px" ,height:"32px"}} />
        </div>
        <div className="text-content">
          <div className="name" style={{ color: "black" }}>
          {recipientUser?.name}
            {/* {recipientUser?.fname} {recipientUser?.lname} */}
          </div>
          <div className="text" style={{fontSize:'12.5px'}}>
  {latestMessage && (
    <span
      style={{
        fontWeight: hasUnreadMessages ? "700" : "300",
        color: hasUnreadMessages ? "#000" : "rgb(61, 61, 61) ",
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
    moment(latestMessage?.createdAt).isSame(new Date(), 'day') 
      ? moment(latestMessage?.createdAt).locale("th").format('HH:mm')  // ถ้าเป็นภายในวันเดียวกันให้แสดงเวลา
      : moment(latestMessage?.createdAt).locale("th").format('D MMM')   // ถ้าเกิน 1 วันให้แสดงวันที่และเดือน
  ) : (
    null
  )}
</div>

      </div>
    </Stack>
  );
};

export default NotiChat;
