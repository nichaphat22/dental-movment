import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { baseUrl } from "../../../utils/services";
import { backendUrl } from "../../../utils/services";

function View_Animation3D() {
  const [animation3d, setAnimation3d] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const location = useLocation();

  const animationId = location.state?._id || id;

  useEffect(() => {
    const fetchAnimationData = async () => {
      if (!animationId) {
        setError("Animation id is not defined.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${baseUrl}/animation3D/animation/${animationId}`
        );
        if (!res.ok) throw new Error("ไม่พบแอนิเมชั่นนี้");
        const data = await res.json();
        setAnimation3d(data);
      } catch (error) {
        setError("Error fetching animation.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimationData();
  }, [animationId]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // รีเซ็ตเวลาเล่นวิดีโอ
      videoRef.current.play(); // เล่นวิดีโอใหม่
    }
  };

  return (
    <div className="ViewAnimation flex flex-wrap justify-center">
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : animation3d ? (
        <div className="video text-center">
          <h1 className="text-base md:text-lg lg:text-2xl font-bold mt-4 mb-2.5">
            {animation3d.name}
          </h1>
          <video
            ref={videoRef}
            controls
            onEnded={handleVideoEnded}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl rounded-lg shadow-sm"
          >
            <source
              src={`${backendUrl}/${animation3d.animationFile.path}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          {animation3d.description && (
            <div className="ani_description self-start mt-0.5 text-gray-600 border w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl rounded-lg shadow-sm min-h-[150px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
              <div className="p-4 text-justify">{animation3d.description}</div>
            </div>
          )}
        </div>
      ) : (
        <p>ไม่พบแอนิเมชันนี้</p>
      )}
    </div>
  );
}

export default View_Animation3D;
