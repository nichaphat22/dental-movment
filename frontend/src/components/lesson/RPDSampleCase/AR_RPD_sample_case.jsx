import React, { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function AR_RPD_sample_case({ modelUrl, scale }) {
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (modelUrl) {
      const loadModel = async () => {
        const loader = new GLTFLoader();
        try {
          const gltf = await loader.loadAsync(modelUrl);
          console.log("Model loaded:", gltf);
          const loadedModel = gltf.scene;

          // กำหนด scale ของโมเดล
          loadedModel.scale.set(scale, scale, scale);

          setModel(loadedModel);
          console.log("Model should now be visible");
        } catch (error) {
          console.error("Error loading model:", error);
        }
      };
      loadModel();
    }
  }, [modelUrl, scale]);

  return (
    <>
      {model && <primitive object={model} />}
    </>
  );
}

export default AR_RPD_sample_case;
