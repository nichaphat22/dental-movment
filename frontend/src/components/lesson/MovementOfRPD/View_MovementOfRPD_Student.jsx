import React, { useEffect, useState } from "react";
import "./MovementOfRPD.css";
import { ref as dbRef, get, remove } from "firebase/database";
import { ref as storageRef, getDownloadURL, deleteObject } from "firebase/storage"; 
import { storage, database } from "../../../config/firebase";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { HiPlusSm } from "react-icons/hi";
import { useSelector } from "react-redux";
import { animate } from "framer-motion";

function View_MovementOfRPD_Student() {
const [animation3d, setAnimation3d] = useState([]);
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [error, setError] = useState(null); // ข้อความ error
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAnimations = async () => {
      const animationsRef = dbRef(database, "animations/");
      const snapshot = await get(animationsRef);
      if (snapshot.exists()) {
        setAnimation3d(Object.values(snapshot.val()));
      } else {
        setAnimation3d([]);
      }
    };

    fetchAnimations();
  }, []);

  const handleAnimationClick = (animation) => {
    navigate(`/animation3d/${animation.name}/view`, {
      state: animation,
    });
  }

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
            onClick={() =>handleAnimationClick(animation)}
          >
            <img
              src={animation.imageUrl}
              alt={animation.name}
              className="cursor-pointer mb-4 w-full rounded hover:transform-none shadow-none"
            />
            <h3 className="md:text-base lg:text-lg font-normal mb-2 text-center break-words">
              {animation.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default View_MovementOfRPD_Student;
