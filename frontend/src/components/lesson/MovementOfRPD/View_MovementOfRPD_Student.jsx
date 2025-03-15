import React, { useEffect, useState } from "react";
import "./MovementOfRPD.css";
import { ref, get } from "firebase/database";
import { database } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";

function View_MovementOfRPD_Student() {
  const [animation3d, setAnimation3d] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ดึงข้อมูลจาก Firebase Realtime Database
    const fetchAnimation3d = async () => {
      try {
        const animation3dRef = ref(database, "animation3d");
        const snapshot = await get(animation3dRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const animationList = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name,
            url: data[key].url,
            aniImageUrl: data[key].aniImageUrl,
          }));
          setAnimation3d(animationList);
        }
      } catch (error) {
        console.error("Error fetching animation3d data:", error);
      }
    };

    fetchAnimation3d();
  }, []);

  const handleImageClick = (name, url, aniImageUrl) => {
    navigate(`/animation3d/${name}/view`, {
      state: { selectedFile: { name, url, aniImageUrl } },
    });
  };

  return (
    <div className="cont">
      <h1 className="mx-4 my-2 text-base md:text-lg lg:text-2xl font-semibold">
        การเคลื่อนที่ของฟันเทียม
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-center md:mx-10 lg:mx-4">
        {animation3d.map((animation) => (
          <div
            className="cursor-pointer bg-white shadow-sm rounded-lg p-4 lg:transform lg:transition lg:duration-300 lg:hover:scale-105 lg:hover:shadow-md"
            key={animation.id}
            onClick={() => handleImageClick(animation.name, animation.url, animation.aniImageUrl)}
          >
            <img
              src={animation.aniImageUrl}
              alt={animation.name}
              className="cursor-pointer mb-4 w-full rounded hover:transform-none shadow-none"
            />
            <h3 className="md:text-base lg:text-lg font-bold mb-2 text-center break-words">
              {animation.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default View_MovementOfRPD_Student;
