import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { baseUrl } from '../../../utils/services';
function VideoList() {
    const [Animations, setAnimations] = useState([]);

    useEffect(() => {
        // ดึงข้อมูลวิดีโอจาก API หรือฐานข้อมูล
        axios.get(`${baseUrl}/animation/getAnimation`)
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
                        <source src={`data:video/mp4;base64,${animation.Ani_animation.data}`}/>
                        Your browser does not support the video tag.
                    </video>
                    <h3>{animation.Ani_name}</h3>
                    <p>{animation.Ani_description}</p>
                </div>
            ))}
        </div>
    );
}

export default VideoList;
