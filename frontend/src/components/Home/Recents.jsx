import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../utils/services";

// Card สำหรับแสดงข้อมูลของการกระทำ
const RecentActionCard = ({ action, handleAction }) => {
    const navigate = useNavigate();

    
  // ฟังก์ชันจัดการการคลิกปุ่ม
  const handleClick = () => {
    if (action.animationId) {
      navigate(`/animation/view/${action.animationId._id}`); // ไปที่หน้า Animation
    } else if (action.quizId) {
      navigate(`/Quiz/${action.quizId._id}`); // ไปที่หน้า Quiz
    } else {
      navigate("/3d-media"); // ไปที่หน้า 3D Media ถ้าไม่มี animationId หรือ quizId
    }

    // เรียกใช้ handleAction หากต้องการส่งข้อมูลไปยัง backend
    handleAction(action.action, action.animationId?._id, action.quizId?._id);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-2xl text-start font-semibold mb-1">{action.action}</h3>
      <p className="text-base  text-gray-600">
        {action.animationId
          ? `📖 บทเรียน: ${action.animationId.Ani_name}`
          : action.quizId
          ? `📝 แบบทดสอบ: ${action.quizId.title}`
          : "📌 สื่อ 3D"}
      </p>
      <p className="text-xs text-gray-500 ">🕒 {moment(action.createdAt).fromNow()}</p>
      <div className="flex justify-end m-2">
      <button
        onClick={handleClick} // เรียกใช้ handleAction เมื่อคลิก
        className=" mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        {action.animationId
          ? "ดูสื่อการสอน"
          : action.quizId
          ? "ทำแบบทดสอบ"
          : "ดูสื่อ 3D"}
      </button>
        
      </div>
      
    </div>
  );
};

const Recents = ({ userId }) => {
  const [recentActions, setRecentActions] = useState([]);

  useEffect(() => {
    const fetchRecentActions = async () => {
      try {
        const res = await axios.get(`${baseUrl}/recent/${userId}`);
        setRecentActions(res.data);
      } catch (error) {
        console.error("Error fetching recent actions:", error);
      }
    };

    if (userId) {
      fetchRecentActions();
    }
  }, [userId]);

  // ฟังก์ชันบันทึกการกระทำ
  const handleAction = async (actionType, animationId = null, quizId = null) => {
    try {
      await axios.post(`${baseUrl}/recent`, {
        userId,
        action: actionType,  // เช่น "ดูสื่อการสอน" หรือ "ทำแบบทดสอบ"
        animationId,  // หากมี
        quizId,  // หากมี
      });
    } catch (error) {
      console.error("Error saving action:", error);
    }
  };

  return (
    <div className="w-full p-6 ">
      {recentActions.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {recentActions.map((action) => (
            <SwiperSlide key={action._id}>
              <RecentActionCard action={action} handleAction={handleAction} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="flex justify-center items-center min-h-[180px] w-full">
          <div className=" justify-center items-center">
            <p className="text-gray-500 text-base">ไม่มีรายการล่าสุด</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recents;
