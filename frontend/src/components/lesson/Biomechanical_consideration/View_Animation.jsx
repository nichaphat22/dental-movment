import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { baseUrl } from '../../../utils/services';

function View_Animation() {
  const [animation, setAnimation] = useState(null);
  const { id } = useParams(); // รับค่าไอดีจาก URL
  const videoRef = useRef(null);

  useEffect(() => {
    fetchAnimation();
  }, []);

  useEffect(() => {
    // เมื่อ animation มีค่าแล้ว
    if (animation && videoRef.current) {
      // กำหนด source ของวิดีโอ
      videoRef.current.src = `data:${animation.Ani_animation.contentType};base64,${animation.Ani_animation.data}`;
      // เริ่มเล่นวิดีโอ
      videoRef.current.play();
    }
  }, [animation]);

  const fetchAnimation = () => {
    axios
      .get(`${baseUrl}/animation/getAnimationById/${id}`)
      .then((response) => {
        setAnimation(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleVideoEnded = () => {
    // เมื่อวิดีโอจบการเล่น
    // ให้เริ่มเล่นใหม่
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // กลับไปที่ตำแหน่งเริ่มต้นของวิดีโอ
      videoRef.current.play(); // เริ่มเล่นวิดีโอใหม่
    }
  };

  return (
    <div className="ViewAnimation" style={{ display: "flex",width:'auto',justifyContent: "center",margin:'10px 20px 10px 20px'  }}>
      {animation && (
        <>
        <div className="viewvdo">
         
          <video
            id="animationVideo"
            ref={videoRef}
            controls
            onEnded={handleVideoEnded}
          />
          <div className="" style={{boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)' }}>
           <h1 className="AnimationName">{animation.Ani_name}</h1>
           <p className="ani_descrip">{animation.Ani_description}</p>
           </div>
        </div>
        
        </>
      )}
    </div>
  );
}

export default View_Animation;
