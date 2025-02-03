import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";
import { unreadNotificationsFunc } from "../../utils/unreadNotificationsFunc";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from 'moment/min/moment-with-locales'; // Correct import statement

moment.locale('th'); // Set locale to Thai

import { LazyLoadImage } from 'react-lazy-load-image-component';  // Import LazyLoadImage

const NotiChat = ({ chat, user }) => {
  // ดึงข้อมูลผู้รับจาก custom hook useFetchRecipientUser
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const navigate = useNavigate();

  // ดึงข้อมูลจาก ChatContext
  const {  } = useContext(ChatContext);

  // ดึงข้อความล่าสุดจาก custom hook useFetchLatestMessage
  const { latestMessage: initialLatestMessage } = useFetchLatestMessage(chat, user);

  // สร้าง state สำหรับเก็บข้อความล่าสุด
  const [latestMessage, setLatestMessage] = useState(initialLatestMessage);
  

  // ใช้ useEffect เพื่ออัปเดตข้อความล่าสุดเมื่อ initialLatestMessage เปลี่ยนแปลง
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

// ฟังก์ชันในการคลิกเพื่อทำให้การแจ้งเตือนเป็น "อ่านแล้ว"
const handleClick = (id) => {
  console.log("Navigating to:", `/chat/${id}`);
  navigate(`/chat/${id}`);
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
