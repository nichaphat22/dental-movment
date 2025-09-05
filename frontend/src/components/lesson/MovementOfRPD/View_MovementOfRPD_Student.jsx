import React, { useEffect, useState } from "react";
import "./MovementOfRPD.css";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { HiPlusSm } from "react-icons/hi";
import { useSelector } from "react-redux";
import { animate } from "framer-motion";
import { baseUrl } from "../../../utils/services";
import { backendUrl } from "../../../utils/services";
import { button } from "@material-tailwind/react";
import axios from "axios";


function View_MovementOfRPD_Student() {
  const [animation3d, setAnimation3d] = useState([]);
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [error, setError] = useState(null); // ข้อความ error
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        const res = await fetch(`${baseUrl}/animation3D/animations`);
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
        const data = await res.json();

        const sortedData = data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setAnimation3d(sortedData);
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimations();
  }, []);

  const handleAction = async ({
  actionType,
  animationId = null,
  animationTitle = null,
  quizId = null,
  quizTitle = null,
  modelId = null,
  modelTitle = null,
  animation3DId = null,
  animation3DTitle = null,
}) => {
  if (!user) return;

  try {
    await axios.post(`${baseUrl}/recent`, {
      userId: user._id,
      action: actionType,
      animationId,
      animationTitle,
      quizId,
      quizTitle,
      modelId,
      modelTitle,
      animation3DId,
      animation3DTitle,
    });
  } catch (error) {
    console.error("Error saving action:", error);
  }
};


  const handleAnimationClick = (animation) => {
    handleAction({
    actionType: "การเคลื่อนที่ของฟันเทียม",
    animation3DId: animation._id,
    animation3DTitle: animation.name,
  });
    navigate(`/animation3d/${animation._id}/view`, {
      state: animation,
    });
  };

 

  if (loading) {
    return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="cont">
      <h1 className="mx-4 my-2 text-base md:text-lg lg:text-2xl font-semibold">
        การเคลื่อนที่ของฟันเทียม
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-center md:mx-10 lg:mx-4">
        {animation3d.map((animation3d) => (
          <div
            className="cursor-pointer bg-white shadow-sm rounded-lg p-4 lg:transform lg:transition lg:duration-300 lg:hover:scale-105 lg:hover:shadow-md"
            key={animation3d._id}
            onClick={() => handleAnimationClick(animation3d)}
          >
            <img
              src={`${backendUrl}/${animation3d.imageFile.path}`}
              alt={animation3d.name}
              className="cursor-pointer mb-4 w-full rounded hover:transform-none shadow-none"
            />
            <h3 className="md:text-base lg:text-lg font-normal mb-2 text-center text-wrap" >
              {animation3d.name}
            </h3>

           
          </div>
        ))}
      </div>
    </div>
  );
}

export default View_MovementOfRPD_Student;
