import React, { useEffect, useState } from 'react';
import { ARCanvas, ARMarker } from '@artcom/react-three-arjs';
import { ref, get } from 'firebase/database';
import { database } from '../../../config/firebase';
import AR_RPD_sample_case from './AR_RPD_sample_case';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ImCross } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function ARScene() {
  const [patterns, setPatterns] = useState([]);
  const [isARActive, setIsARActive] = useState(true);
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);
  const [modelVisible, setModelVisible] = useState(false);

  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const modelsRef = ref(database, 'models/');
        const snapshot = await get(modelsRef);
        if (snapshot.exists()) {
          const modelsData = snapshot.val();
          const modelsArray = Object.entries(modelsData)
            .filter(([key, model]) => model && Object.keys(model).length > 0)
            .map(([key, model]) => ({
              patternUrl: model.patternUrl,
              modelUrl: model.url,
            }));

          setPatterns(modelsArray);
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchModelData();
  }, []); // ไม่ต้องใช้ useMemo อีกต่อไป
  console.log("pattern", patterns);
  const handleClose = () => {
    setIsARActive(false); // ปิด AR ก่อน

    setTimeout(() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        window.close();
      }
    }, 300); // ให้เวลา ARCanvas ถูกปิดก่อนเปลี่ยนหน้า

    // 🔥 ปิดกล้องจริง ๆ
    const mediaStream = document.querySelector('video')?.srcObject;
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop()); // หยุดกล้อง
    }

    // 🔥 ลบวิดีโอกล้องออกจาก DOM
    const arVideo = document.getElementById('arjs-video');
    if (arVideo) {
      arVideo.srcObject = null; // ปิดสตรีมกล้อง
      arVideo.remove(); // ลบออกจาก DOM
    }

    // 🔥 ลบ ARCanvas ออกจาก DOM
    const arCanvas = document.querySelector('canvas');
    if (arCanvas) {
      arCanvas.remove();
    }

    // ทำนุบำรุงการปล่อยทรัพยากร (dispose)
    const disposeResources = () => {
      // ลบ ARMarker และ ARCanvas
      const arMarkers = document.querySelectorAll('ar-marker');
      arMarkers.forEach((marker) => {
        marker.dispose(); // ถ้ามี dispose method
      });
    };

    disposeResources();
  };

  useEffect(() => {
    // ตรวจสอบขนาดหน้าจอ
    const updateScale = () => {
      const windowWidth = window.innerWidth;

      if (windowWidth < 1024) {
        setScale(0.028);  // เล็กลงสำหรับหน้าจอเล็กกว่า 1024px
      } else {
        setScale(0.04);   // ปรับขนาดสำหรับหน้าจอที่ใหญ่กว่า
      }
    };

    // เรียกใช้งานเมื่อโหลดหน้าจอและขนาดหน้าจอเปลี่ยน
    updateScale();
    window.addEventListener('resize', updateScale);

    // ทำความสะอาดการใช้ event listener เมื่อ component ถูกทำลาย
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const [cameraSettings, setCameraSettings] = useState({
    fov: 100,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10
  });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();

        // อัปเดตค่ากล้องให้ตรงกับอุปกรณ์
        setCameraSettings((prev) => ({
          ...prev,
          aspect: settings.aspectRatio || prev.aspect,
          fov: settings.focalLength ? (2 * Math.atan(36 / (2 * settings.focalLength)) * (180 / Math.PI)) : prev.fov
        }));

        // หยุดใช้กล้องหลังจากดึงข้อมูลแล้ว
        track.stop();
      })
      .catch((err) => console.error("Error accessing camera:", err));
  }, []);
  useEffect(() => {
    console.log("Number of patterns loaded:", patterns.length);
  }, [patterns]);


  const onMarkerFound = (pattern) => {
    console.log("Marker detected:", pattern.patternUrl);
    if (!modelVisible) {
      setModelVisible(true);  // Only update if model isn't already visible
    }
  };

  const onMarkerLost = (pattern) => {
    console.log("Marker lost:", pattern.patternUrl);
    if (modelVisible) {
      setModelVisible(false);  // Only update if model is currently visible
    }
  };


  return (
    <div>
      {isARActive ? (
        <ARCanvas
          className='ar-Scene'
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10000,
            width: '100vw',
            height: '100vh',
          }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.setSize(window.innerWidth, window.innerHeight);
            gl.setPixelRatio(window.devicePixelRatio); // ใช้ค่าความละเอียดของอุปกรณ์
          }}
          camera={cameraSettings} // ใช้ค่ากล้องที่อัปเดตจากอุปกรณ์
          
        >
          <ambientLight intensity={0.5} />
          <directionalLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={0.5} />

          {patterns.map((pattern, index) => (
            <ARMarker
              key={index}
              debug={true}
              params={{
                smooth: true,
                smoothCount: 5,   // ลดจำนวนเฟรมที่ใช้ในการคำนวณ
                smoothTolerance: 0.05,  // ลดค่าความทนทานเพื่อให้การหมุนเร็วขึ้น
                minConfidence: 0.1 // เพิ่มความแม่นยำในการตรวจจับมาร์กเกอร์
              }} // ปรับค่าความมั่นใจ
              type={'pattern'}
              patternUrl={pattern.patternUrl}
              // onMarkerFound={() => setModelVisible(true)}
              // onMarkerLost={() => setTimeout(() => setModelVisible(true), 1000)}  // อย่าลบโมเดลออก
              onMarkerFound={() => onMarkerFound(pattern)}  // Marker found handler
              onMarkerLost={() => onMarkerLost(pattern)}    // Marker lost handler
            >
              
              <AR_RPD_sample_case modelUrl={pattern.modelUrl} scale={scale} 
                position={[0, 1, 0]}
              rotation={[ 1.2, 0, 0]} 
               
              />
            </ARMarker>
          ))}
        </ARCanvas>
      ) : (
        <p>AR Mode exited.</p>
      )}

      <Button
        className='bt-cross'
        variant="primary"
        onClick={handleClose} // ใช้ฟังก์ชัน handleClose
        style={{ background: ' rgb(166, 84, 249)', borderColor: '', position: 'absolute', padding: '8px', top: '10px', right: '8px', zIndex: 10000, boxShadow: 'rgb(0, 0, 0) 0px 50px 100px -20px, rgba(0, 0, 0, 0.38) 0px 30px 60px -30px, rgb(27, 11, 62) 0px -2px 6px 0px inset' }}
      >
        <span style={{ color: '#fff', fontWeight: '300', fontSize: '1.7rem' }}>
          <IoMdClose />
        </span>
      </Button>
    </div>
  );
}

export default ARScene;
