import React, { useEffect, useState } from 'react'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function AR_RPD_sample_case({ modelUrl, scale }) {
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (modelUrl) {
      const loadModel = async () => {
        const loader = new GLTFLoader();
        try {
          const gltf = await loader.loadAsync(modelUrl);
          // console.log("Model loaded:", gltf);
          const loadedModel = gltf.scene;

          // กำหนด scale ของโมเดล
          loadedModel.scale.set(scale, scale, scale);

          setModel(loadedModel);
          // console.log("model",model);
          console.log("Model should now be visible");
        } catch (error) {
          console.error("Error loading model:", error);
        }
      };
      loadModel();
    }

    // Cleanup function to dispose of the model when it's no longer needed
    return () => {
      if (model) {
        // หากมีการใช้งานโมเดลแล้ว ให้ทำการ dispose
        model.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();  // Dispose geometry
            child.material.dispose();   // Dispose material
          }
        });
        setModel(null);
      }
    };
  }, [modelUrl, scale, model]);

  return (
    <>
      {model && <primitive object={model} />}
    </>
  );
}

export default AR_RPD_sample_case;
