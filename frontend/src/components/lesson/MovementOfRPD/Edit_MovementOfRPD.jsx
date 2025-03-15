import React, { useEffect, useState } from "react";
import { ref, get, set } from "firebase/database"; 
import { database } from "../../../config/firebase"; 
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./MovementOfRPD.css";

function Edit_MovementOfRPD() {
  const location = useLocation();
  const [animationName, setAnimationName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimationData = async () => {
      if (!location.state || !location.state.name) {
        console.error("Animation name is not defined.");
        return;
      }

      const animationRef = ref(database, `animation3d/${location.state.name}`);
      try {
        const snapshot = await get(animationRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setAnimationName(data.name);
          setVideoUrl(data.videoUrl);
          setImageUrl(data.imageUrl);
        } else {
          console.warn("Animation not found in database.");
        }
      } catch (error) {
        console.error("Error fetching animation:", error);
      }
    };

    fetchAnimationData();
  }, [location.state]);

  const handleUpdateAnimation = async () => {
    if (!animationName || !videoUrl || !imageUrl) {
      Swal.fire("Missing Data", "Please provide all fields.", "warning");
      return;
    }

    try {
      const animationRef = ref(database, `animation3d/${animationName}`);
      await set(animationRef, {
        name: animationName,
        videoUrl,
        imageUrl
      });

      Swal.fire("Success", "Animation updated successfully!", "success");
      navigate("/MovementOfRPD");
    } catch (error) {
      console.error("Error updating animation:", error);
      Swal.fire("Error", "Failed to update animation.", "error");
    }
  };

  return (
    <div className="Content">
      <h1 className="text-lg md:text-xl lg:text-3xl text-center font-bold mt-2.5">
        การเคลื่อนที่ของฟันเทียม
      </h1>
      <div className="bg-white m-4">
        <div className="mb-6 p-4 border rounded-md bg-gray-100">
          <h1 className="mb-2 text-sm md:text-base lg:text-lg">Edit Animation</h1>
          <div>
            <label className="mr-3 mb-2 text-sm md:text-base">Animation Name:</label>
            <input
              type="text"
              value={animationName}
              onChange={(e) => setAnimationName(e.target.value)}
              className="text-xs md:text-sm text-black w-full border border-gray-300 rounded-md p-2 lg:w-11/12"
            />
          </div>

          <br />
          <label className="text-sm md:text-base">Animation Video URL:</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="text-xs md:text-sm text-black w-full border border-gray-300 rounded-md p-2 lg:w-11/12"
          />
          {videoUrl && (
            <video controls className="w-96 lg:w-2/5">
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}

          <br />
          <label className="text-sm md:text-base">Image URL:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="text-xs md:text-sm text-black w-full border border-gray-300 rounded-md p-2 lg:w-11/12"
          />
          {imageUrl && <img src={imageUrl} alt="Preview" className="w-96 lg:w-2/5" />}

          <hr />
          <div className="flex items-center justify-center w-full text-xs md:text-sm mt-5">
            <button
              className="bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
              onClick={() => navigate("/MovementOfRPD")}
            >
              ยกเลิก
            </button>
            <button
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
              onClick={handleUpdateAnimation}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Edit_MovementOfRPD;
