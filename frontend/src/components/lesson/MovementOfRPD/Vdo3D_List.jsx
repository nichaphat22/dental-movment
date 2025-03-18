import React, { useEffect, useState } from "react";
import axios from "axios";
import './MovementOfRPD.css';

function Vdo3D_List() {
    const [Animations, setAnimations] = useState([]);

    useEffect(() => {
        // ดึงข้อมูลวิดีโอจาก API หรือฐานข้อมูล
        axios.get("/api/animation3D/getAnimation3D")
            .then(response => {
                setAnimations(response.data);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }, []);

  return (
    <div className="video-list">
            {Animations.map(animation => (
                <div key={animation._id} className="video-item">
                    <video controls>
                        <source src={`data:video/mp4;base64,${animation.Ani3D_animation.data}`}/>
                        Your browser does not support the video tag.
                    </video>
                    <h3>{animation.Ani3D_name}</h3>
                    <p>{animation.Ani3D_description}</p>
                </div>
            ))}
    </div>
  );
}

export default Vdo3D_List;