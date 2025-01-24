import React, { useState, useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; 
import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function TestAR({ modelUrl }) {
  const [scene, setScene] = useState(null);
  const canvasRef = useRef(null);
  const controls = useRef(null); 

  useEffect(() => {
    if (modelUrl) {
      const loadModel = async () => {
        const loader = new GLTFLoader();
        const model = await loader.loadAsync(modelUrl);
        setScene(model.scene);
      };

      loadModel();
    }
  }, [modelUrl]);

  useEffect(() => {
    if (scene) {
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); 
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(1020, 876);
      renderer.setClearColor(0xbdbdbd, 0);
      canvasRef.current.appendChild(renderer.domElement);

      // Set model scale
      scene.scale.set(2, 2, 2);

      // Set model position to center of the scene
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);

      camera.position.z = 10;

      // สร้าง OrbitControls และกำหนด camera, renderer
      controls.current = new OrbitControls(camera, renderer.domElement);

      const animate = function () {
        requestAnimationFrame(animate);
        controls.current.update(); // เรียกใช้งาน OrbitControls
        renderer.render(scene, camera);
      };
      animate();

      return () => {
      };
    }
  }, [scene]);

  return <div ref={canvasRef}></div>;
}

export default TestAR;
