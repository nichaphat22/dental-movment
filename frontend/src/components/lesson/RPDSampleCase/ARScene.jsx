import React, { useEffect, useState } from 'react';
import { ARCanvas, ARMarker } from '@artcom/react-three-arjs';
import { ref, get } from 'firebase/database';
import { database } from '../../../config/firebase';
import AR_RPD_sample_case from './AR_RPD_sample_case';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ImCross } from "react-icons/im";

function ARScene() {
  const [patterns, setPatterns] = useState([]);
  const [isARActive, setIsARActive] = useState(true);
  const navigate = useNavigate();

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
          onCreated={({ gl }) => {
            gl.setSize(window.innerWidth, window.innerHeight);
            gl.setPixelRatio(window.devicePixelRatio);
          }}
          camera={{
            position: [0, 0, 10],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />

          {patterns.map((pattern, index) => (
            <ARMarker
              key={index}
              debug={true}
              params={{ smooth: false }}
              type={'pattern'}
              patternUrl={pattern.patternUrl}
            >
              <AR_RPD_sample_case modelUrl={pattern.modelUrl} scale={0.05} />
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
        style={{ position: 'absolute', top: '10px', right: '8px', zIndex: 10000 }}
      >
        <span style={{ color: '#000', fontWeight: '100', fontSize: '1.5rem' }}>
          <ImCross />
        </span>
      </Button>
    </div>
  );
}

export default ARScene;
