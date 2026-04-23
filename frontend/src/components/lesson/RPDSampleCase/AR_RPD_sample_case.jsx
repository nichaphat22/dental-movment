import React, { useEffect, useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";

// Global loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

function AR_RPD_sample_case({
  modelUrl,
  targetSize = 100,   // ขนาด normalize ที่ต้องการ
  baseScale = 0.1,      // ปรับรวม scale สำหรับ AR
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const [model, setModel] = useState(null);
  const modelRef = useRef(null);

  // // responsive scale factor ตามขนาดหน้าจอ
  // const getDeviceScale = () => {
  //   const width = window.innerWidth;
  //   if (width < 640) return 0.8;
  //   if (width < 1024) return 1.0;
  //   return 1.2;
  // };

  useEffect(() => {
    if (!modelUrl) return;

    let isMounted = true;

    gltfLoader.load(
      modelUrl,
      (gltf) => {
        if (!isMounted) return;
        const loadedModel = gltf.scene;

        // normalize scale
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        // responsive factor ตามขนาดหน้าจอ
        let deviceFactor = 1;
        const width = window.innerWidth;
        if (width < 640) deviceFactor = 0.8;
        else if (width < 1024) deviceFactor = 1.0;
        else deviceFactor = 1.2;

      
         // normalize + responsive
        const finalScale = baseScale * deviceFactor * (targetSize / maxDim);
        loadedModel.scale.setScalar(finalScale);

        loadedModel.position.set(...position);
        loadedModel.rotation.set(...rotation);

        modelRef.current = loadedModel;
        setModel(loadedModel);
        console.log("Bounding box size:", size, "maxDim:", maxDim);


        console.log("Model loaded:", modelUrl, "→ finalScale:", finalScale);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    return () => {
      isMounted = false;
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        modelRef.current = null;
      }
    };
  }, [modelUrl, targetSize, baseScale, position, rotation]);

  return <>{model && <primitive object={model} />}</>;
}

export default AR_RPD_sample_case;
