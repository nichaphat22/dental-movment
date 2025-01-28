import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const PotentialChats = () => {
  // ใช้ useContext เพื่อดึงข้อมูลจาก Context ต่างๆ
  const { user } = useContext(AuthContext); // ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ
  const { potentialChats, createChat, onlineUsers } = useContext(ChatContext); // ดึงข้อมูลการสนทนาและฟังก์ชันจาก ChatContext

  // กรองเฉพาะผู้ที่มีบทบาทเป็นครู (teacher)
  const teacherChats = potentialChats.filter((u) => u.role === 'teacher');

  return (
    <div className="all-users">
      {teacherChats &&
        teacherChats.map((u, index) => (
          <div
            className="single-user" // คลาส CSS สำหรับการจัดรูปแบบผู้ใช้แต่ละคน
            key={index} // ใช้ index เป็น key สำหรับการทำแผนที่ของ React
            onClick={() => createChat(user._id, u._id)} // ฟังก์ชันคลิกเพื่อสร้างการสนทนาใหม่กับผู้ใช้ที่เลือก
          >
            {u.fname} {u.lname}
            <span
              className={
                onlineUsers?.some((user) => user?.userId === u._id)
                  ? "user-online" : "" // ถ้าผู้ใช้คนนี้ออนไลน์ ให้เพิ่มคลาส "user-online"
              }
            ></span>
          </div>
        ))}
    </div>
  );
};

export default PotentialChats;
