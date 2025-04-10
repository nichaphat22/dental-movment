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

function View_MovementOfRPD() {
  const [animation3d, setAnimation3d] = useState([]);
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [error, setError] = useState(null); // ข้อความ error
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
    const [selectedFileName, setSelectedFileName] = useState("");

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




  const goToEditPage = (animation) => {
    navigate(`/Edit-MovementOfRPD/${animation.id}/edit`, {
      state: animation,
    });
  };

  const removeAnimation = async (animation) => {
    const confirmDelete = await Swal.fire({
      title: "คุณต้องการลบแอนิเมชันนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#9333ea",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const videoRef = storageRef(
          storage,
          `animation3d/${animation.name}/animation3d.mp4`
        );
        const imageRef = storageRef(
          storage,
          `animation3d/${animation.name}/image.jpg`
        );
        await deleteObject(videoRef);
        await deleteObject(imageRef);

        const animationRef = dbRef(database, `animations/${animation.id}`);
        await remove(animationRef);

        Swal.fire("ลบแล้ว!", "แอนิเมชันของคุณถูกลบเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Error deleting animation:", error);
        Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการลบแอนิเมชัน", "error");
      }
    }
  };

  const handleAddAnimation = () => {
    navigate(`/Add-MovementOfRPD`);
  };

  return (
    <div className="cont">
      <div className="flex flex-col md:flex-row justify-between items-center my-2 mx-4">
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mx-4 my-2">
          การเคลื่อนที่ของฟันเทียม
        </h1>
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 md:px-4 md:py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 mt-2 md:mt-0"
          onClick={handleAddAnimation}
        >
          <HiPlusSm className="w-4 h-4 lg:w-5 lg:h-5 mr-1" />
          <span className="text-xs md:text-sm lg:text-base">
            เพิ่มสื่อการสอน
          </span>
        </button>
      </div>

      {/* {loading && <p className="text-center">กำลังโหลด...</p>} แสดงข้อความระหว่างการโหลด */}
      {error && <p className="text-center text-red-500">{error}</p>} {/* แสดงข้อความ error */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-center md:mx-10 lg:mx-4">
        {animation3d.length > 0 ? (
          animation3d.map((animation) => (
            <div
              className="cursor-pointer bg-white shadow-sm rounded-lg p-4 lg:transform lg:transition lg:duration-300 lg:hover:scale-105 lg:hover:shadow-md"
              key={animation.id}
              
            >
              
              <img
                loading="lazy"
                onClick={() => handleAnimationClick(animation)}
                src={animation.imageUrl} // ใช้ URL ที่ดึงมาจาก Database
                alt={animation.name}
                className="cursor-pointer mb-4 w-full rounded hover:transform-none shadow-none"
              />
              <h3 className="md:text-base lg:text-lg font-normal mb-2 text-center break-words">
                {animation.name}
              </h3>
              <div className="flex items-center justify-center w-full text-xs md:text-sm lg:text-base pt-2">
                <button
                  aria-label="Edit animation"
                  className="bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
                  onClick={() => goToEditPage(animation)}
                >
                  แก้ไข
                </button>

                <button
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  onClick={() => removeAnimation(animation)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">ไม่มีสื่อการสอนในขณะนี้</p>
        )}
      </div>
    </div>
  );
}

export default View_MovementOfRPD;
