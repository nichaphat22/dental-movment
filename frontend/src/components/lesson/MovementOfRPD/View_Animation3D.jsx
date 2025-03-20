import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; 
import { ref, get } from "firebase/database";
import { database } from "../../../config/firebase"; // ใช้ Firebase Realtime Database

function View_Animation3D() {
    const [animation3d, setAnimation3d] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const location = useLocation(); // ใช้ location เพื่อรับข้อมูลจาก navigation

    useEffect(() => {
        const fetchAnimationData = async () => {
            if (!location.state || !location.state.id) {
                setError("Animation id is not defined.");
                return;
            }

            const animationId = location.state.id;  // ใช้ id ที่ได้จาก location.state
            const animationRef = ref(database, `animations/${animationId}`);
            
            try {
                const snapshot = await get(animationRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setAnimation3d(data);  // เก็บข้อมูลของแอนิเมชันที่ดึงมาใน state
                    setLoading(false);
                } else {
                    setError("Animation not found in database.");
                    setLoading(false);
                }
            } catch (error) {
                setError("Error fetching animation.");
                setLoading(false);
            }
        };

        fetchAnimationData();
    }, [location.state]);  // ใช้ location.state เป็น dependency เพื่อให้ fetch เมื่อมีการเปลี่ยนแปลง id

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
                <div className="viewvdo text-center">
                    <h1 className="text-base md:text-lg lg:text-2xl font-bold mt-4 mb-2.5">{animation3d.name}</h1>
                    <video
                        ref={videoRef}
                        controls
                        onEnded={handleVideoEnded}
                        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl rounded-lg shadow-sm" 
                    >
                        <source src={animation3d.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {animation3d.description && (
                        <p className="ani_descrip mt-2 text-gray-600">{animation3d.description}</p>
                    )}
                </div>
            ) : (
                <p>ไม่พบแอนิเมชันนี้</p>
            )}
        </div>
    );
}

export default View_Animation3D;
