import React, { useEffect, useState, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ทำเป็น global loader ใช้ร่วมกัน
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

function AR_RPD_sample_case({ modelUrl, scale, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [model, setModel] = useState(null);
  const modelRef = useRef(null);

  useEffect(() => {
    if (!modelUrl) return;

    let isMounted = true;

    gltfLoader.load(
      modelUrl,
      (gltf) => {
        if (!isMounted) return;
        const loadedModel = gltf.scene;

        loadedModel.scale.set(scale, scale, scale);
        loadedModel.position.set(...position);
        loadedModel.rotation.set(...rotation);

        modelRef.current = loadedModel;
        setModel(loadedModel);

        console.log("Model loaded at:", position);
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
  }, [modelUrl, scale, position, rotation]);

  

  return <>{model && <primitive object={model} />}</>;
}


export default AR_RPD_sample_case;
