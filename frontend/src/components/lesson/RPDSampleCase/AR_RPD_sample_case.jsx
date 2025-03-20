import React, { useEffect, useState, useRef } from 'react'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber'; // Import useFrame from @react-three/fiber

function AR_RPD_sample_case({ modelUrl, scale, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [model, setModel] = useState(null);
  const modelRef = useRef(null); // ใช้ useRef สำหรับเก็บโมเดล
  const loader = new GLTFLoader();

  useEffect(() => {
    if (modelUrl) {
      const loadModel = async () => {
        try {
          const gltf = await loader.loadAsync(modelUrl);
          const loadedModel = gltf.scene;

          // กำหนด scale ของโมเดล
          loadedModel.scale.set(scale, scale, scale);

          // กำหนดตำแหน่ง
          loadedModel.position.set(...position);

          // กำหนดการหมุน
          loadedModel.rotation.set(...rotation);

          modelRef.current = loadedModel; // ใช้ useRef แทนการใช้ state
          setModel(loadedModel);
          console.log("Model loaded at:", position);
        } catch (error) {
          console.error("Error loading model:", error);
        }
      };

      loadModel();
    }

    // Cleanup function to dispose of the model when it's no longer needed
    return () => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();  // Dispose geometry
            child.material.dispose();   // Dispose material
          }
        });
        modelRef.current = null;
      }
    };
  }, [modelUrl, scale, position, rotation]);

   // ใช้ useFrame เพื่อหมุนโมเดลอัตโนมัติ
   useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // หมุน 0.01 radian ทุกๆ เฟรม
    }
  });

  return (
    <>
      {model && <primitive object={model} />}
    </>
  );
}

export default AR_RPD_sample_case;
