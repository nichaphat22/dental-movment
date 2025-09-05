import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MovementOfRPD.css";
import { baseUrl } from "../../../utils/services";
import { backendUrl } from "../../../utils/services";
import { animations } from "framer-motion";

function Vdo3D_List() {
  const [Animations, setAnimations] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลวิดีโอจาก API หรือฐานข้อมูล
    axios
      .get(`${baseUrl}/animation3D/getAnimation3D`)
      .then((response) => {
        setAnimations(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="video-list">
      {animations.length === 0 ? (
        <p>ไม่มีสื่อการสอนในขณะนี้</p>
      ) : (
        animations.map((animation) => (
          <div key={animation._id} className="video-item">
            <video controls>
              <source
                src={`${backendUrl}/uploads/video3d/videos/${animation.animationFile}`}
              />
              Your browser does not support the video tag.
            </video>
            <h3>{animation.name}</h3>
            <p>{animation.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Vdo3D_List;
