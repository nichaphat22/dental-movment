import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; 
import { ref, get } from "firebase/database";
import { database } from "../../../config/firebase"; // เปลี่ยนเป็น Realtime Database

function View_Animation3D() {
    const [animation3d, setAnimation3d] = useState(null);
    const { name } = useParams(); 
    const videoRef = useRef(null);

    useEffect(() => {
        fetchAnimation();
    }, [name]); 

    const fetchAnimation = async () => {
        try {
            const animationRef = ref(database, `animation3d/${name}`); // อ้างอิงไปที่ Firebase Database
            const snapshot = await get(animationRef); 

            if (snapshot.exists()) {
                setAnimation3d(snapshot.val()); 
            } else {
                console.error("Animation not found");
            }
        } catch (error) {
            console.error("Error fetching animation:", error);
        }
    };

    const handleVideoEnded = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0; 
            videoRef.current.play(); 
        }
    };

    return (
      <div className="ViewAnimation flex flex-wrap justify-center">
          {animation3d && (
              <div className="viewvdo text-center">
                  <h1 className="text-base md:text-lg lg:text-2xl font-bold mt-4 mb-2.5">{animation3d.name}</h1>
                  <video
                      ref={videoRef}
                      controls
                      onEnded={handleVideoEnded}
                      className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl rounded-lg shadow-sm" 
                  >
                      <source src={animation3d.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                  </video>
                  {animation3d.description && (
                      <p className="ani_descrip mt-2 text-gray-600">{animation3d.description}</p>
                  )}
              </div>
          )}
      </div>
    );
}

export default View_Animation3D;
