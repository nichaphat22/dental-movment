import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { baseUrl, backendUrl } from "../../../utils/services";
import { Card, Button, Row, Col, Container, Spinner } from "react-bootstrap";

function View_Animation() {
  const [animation, setAnimation] = useState(null);
  const { _id } = useParams(); // รับค่าไอดีจาก URL
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (_id) fetchAnimation();
  }, [_id]);

useEffect(() => {
  if (animation && videoRef.current) {
    if (animation.Ani_animation?.path) {
      videoRef.current.src = `${backendUrl}/${animation.Ani_animation.path}`;
      console.log(animation.Ani_animation.path);
      
      videoRef.current.play().catch(() => {});
    } else if (animation.Ani_animation?.data) {
      // ถ้า backend ส่ง base64
      videoRef.current.src = `data:${animation.Ani_animation.contentType};base64,${animation.Ani_animation.data}`;
      videoRef.current.play().catch(() => {});
    }
  }
}, [animation]);


 const fetchAnimation = () => {
  axios
  .get(`${baseUrl}/animation/getAnimationById/${_id}`)
  .then((response) => {
    console.log("🎬 API Animation:", response.data); // 👈 ดูว่ามี Ani_animation.path จริงไหม
    setAnimation(response.data);
    setLoading(false);
  })
  .catch((error) => {
    console.error("Error:", error);
    setLoading(false);
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
    <div
      className="ViewAnimation"
      style={{
        display: "flex",
        width: "auto",
        justifyContent: "center",
        margin: "10px 20px 10px 20px",
      }}
    >
      {loading ? ( // Show loading spinner while data is loading
        // <div className="d-flex justify-content-center my-5">
        //   <Spinner animation="border" style={{ color: "rgb(172, 78, 235)" }} />
        // </div>
        <Button
          variant=""
          disabled
          style={{
            display: "flex", // ใช้ flex เพื่อให้เนื้อหาภายในจัดแนวในแนวนอน
            background: "none",
            border: "none",
            marginTop: "100px",
            alignItems: "center", // ทำให้สปินเนอร์และข้อความอยู่ตรงกลาง
          }}
        >
          <Spinner
            as="span"
            animation="grow"
            //  size="lg"
            role="status"
            aria-hidden="true"
            style={{
              marginRight: "5px",
              background: "rgb(168, 69, 243)",
              width: "25px", // ปรับขนาดของสปินเนอร์
              height: "25px",
            }}
          />
          กำลังโหลด...
        </Button>
      ) : (
        animation && (
          <div className="viewvdo">
            <video
              id="animationVideo"
              ref={videoRef}
              controls
              onEnded={handleVideoEnded}
            />
            <div
              className=""
              style={{ boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)" }}
            >
              <h1 className="AnimationName">{animation.Ani_name}</h1>
              <p className="ani_descrip">{animation.Ani_description}</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default View_Animation;
