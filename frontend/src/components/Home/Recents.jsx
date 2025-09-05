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
      navigate(`/animation/view/${action.animationId._id}`);
    } else if (action.quizId) {
      navigate(`/Quiz/${action.quizId._id}`);
    } else if (action.modelId) {
      navigate(`/Model/${action.modelId._id}/view`,{
        state: { selectedModel: action.modelId }
      });
    } else if (action.animation3DId) {
      navigate(`/animation3d/${action.animation3DId._id}/view`,{
        state: action.animation3DId,
      });
    }
    console.log(action.modelId._id);
    

    // เรียกใช้ handleAction หากต้องการส่งข้อมูลไปยัง backend
    handleAction({
      actionType: action.action,
      animationId: action.animationId?._id,
      quizId: action.quizId?._id,
      modelId: action.modelId?._id,
      animation3DId: action.animation3DId?._id,
    });
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-2xl text-start font-semibold mb-1">
        {action.action}
      </h3>
      <p className="text-base text-gray-600">
        {action.animationId
          ? `📖 บทเรียน: ${action.animationId?.Ani_name || ""}`
          : action.quizId
            ? `📝 แบบทดสอบ: ${action.quizId?.title || ""}`
            : action.modelId
              ? `📌 สื่อ 3D: ${action.modelId?.name || ""}`
              : action.animation3DId
                ? `📖 บทเรียน: ${action.animation3DId?.name || ""}`
                : ""}
      </p>

      <p className="text-xs text-gray-500 ">
        🕒 {moment(action.createdAt).fromNow()}
      </p>
      <div className="flex justify-end m-2">
        <button
          onClick={handleClick} // เรียกใช้ handleAction เมื่อคลิก
          className=" mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {action.animationId
            ? "Biomechanical consideration"
            : action.quizId
              ? "แบบทดสอบ"
              : action.modelId
                ? "RPD sample case"
                : action.animation3DId
                  ? "การเคลื่อนที่ของฟันเทียม"
                  : ""}
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
  const handleAction = async ({
    actionType,
    animationId = null,
    quizId = null,
    modelId = null,
    animation3DId = null,
  }) => {
    if (!userId) return; // ป้องกัน undefined

    try {
      await axios.post(`${baseUrl}/recent`, {
        userId,
        action: actionType,
        animationId,
        quizId,
        modelId,
        animation3DId,
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
