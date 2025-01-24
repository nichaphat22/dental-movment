import React, { useEffect, useState } from 'react';
import { ARCanvas, ARMarker } from '@artcom/react-three-arjs';
import { ref, get } from 'firebase/database';
import { database } from '../../../config/firebase';
import AR_RPD_sample_case from './AR_RPD_sample_case';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // นำเข้า useNavigate
import { RxCross1 } from "react-icons/rx";
import './RPD_sample_case.css'
import { ImCross } from "react-icons/im";


function ARScene() {
  const [patterns, setPatterns] = useState([]);
  const [isARActive, setIsARActive] = useState(true);
  const navigate = useNavigate(); // เรียกใช้ useNavigate เพื่อใช้สำหรับการนำทาง

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
  }, []);

  return (
    <div>
      {isARActive ? (
        <ARCanvas 
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
              onMarkerFound={() => {
                console.log(`Marker found: ${pattern.patternUrl}`);
              }}
              onMarkerLost={() => {
                console.log(`Marker lost: ${pattern.patternUrl}`);
              }}
            >
              <AR_RPD_sample_case modelUrl={pattern.modelUrl} scale={0.05} />
            </ARMarker>
          ))}
        </ARCanvas>
      ) : (
        <p>AR Mode exited. Click the button to re-enter AR mode.</p>
      )}

      <Button
        className='bt-cross'
        variant="primary"
        onClick={() => navigate(-1)} // กดแล้วกลับไปหน้าก่อนหน้านี้
        style={{ position: 'absolute', top: '10px', right: '8px'}}
      >
        <span  style={{color:'#000', fontWeight:'100',fontSize:'1.5rem'}}><ImCross/></span>  
      </Button>
    </div>
  );
}

export default ARScene;
