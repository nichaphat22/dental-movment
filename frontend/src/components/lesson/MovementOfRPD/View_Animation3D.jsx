import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; 
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase"; 

function View_Animation3D() {
    const [animation3d, setAnimation3d] = useState(null); // ใช้ null แทน array
    const { name } = useParams(); // รับชื่อจาก URL
    const videoRef = useRef(null);

    useEffect(() => {
        fetchAnimation();
    }, [name]); // เพิ่ม name ใน dependency array

    const fetchAnimation = async () => {
        try {
            const animation3dRef = ref(storage, `animation3d/${name}/animation3d.mp4`); // ใช้ name เพื่อสร้าง path
            const videoUrl = await getDownloadURL(animation3dRef); 
            // const descriptionRef = ref(storage, `animation3d/${name}/description.txt`); 
            // const descriptionUrl = await getDownloadURL(descriptionRef);
            
            // const descriptionText = await fetch(descriptionUrl).then(res => res.text());

            setAnimation3d({
                Ani3D_name: name, // ใช้ name เป็นชื่อ
                // Ani3D_description: descriptionText, 
                videoUrl: videoUrl 
            });
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
                  <h1 className="AnimationName text-lg font-semibold">{animation3d.Ani3D_name}</h1>
                  <video
                      id="animationVideo"
                      ref={videoRef}
                      controls
                      onEnded={handleVideoEnded}
                      className="w " 
                  >
                      <source src={animation3d.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                  </video>
                  {/* <p className="ani_descrip">{animation3d.Ani3D_description}</p> แสดงคำบรรยาย */}
              </div>
          )}
      </div>
  
    );
}

export default View_Animation3D;
