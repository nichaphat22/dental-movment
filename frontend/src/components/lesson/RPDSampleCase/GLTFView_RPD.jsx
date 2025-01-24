import React, { useState, useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; // นำเข้า GLTFLoader สำหรับโหลดโมเดล GLTF
import * as THREE from 'three'; // นำเข้าห้องสมุด THREE.js

function GLTFView_RPD({ url, onModelClick }) {
  // สถานะสำหรับเก็บโมเดลที่โหลดแล้ว
  const [model, setModel] = useState(null);
  // การอ้างอิงไปยัง element ของ canvas
  const canvasRef = useRef(null);
  // การอ้างอิงไปยัง renderer
  const renderer = useRef(null);

  useEffect(() => {
    if (url) {
      // ฟังก์ชันสำหรับโหลดโมเดล
      const loadModel = async () => {
        const loader = new GLTFLoader(); // สร้าง instance ของ GLTFLoader
        const loadedModel = await loader.loadAsync(url); // โหลดโมเดลจาก URL
        setModel(loadedModel.scene); // ตั้งค่าโมเดลที่โหลดแล้วลงใน state
      };

      loadModel(); // เรียกใช้ฟังก์ชันโหลดโมเดล
    }
  }, [url]); // ฟังก์ชันนี้จะทำงานเมื่อ URL เปลี่ยนแปลง

  useEffect(() => {
    if (model) {
      // สร้างกล้อง PerspectiveCamera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
      renderer.current = new THREE.WebGLRenderer(); // สร้าง instance ของ WebGLRenderer
      renderer.current.setSize(200, 200); // ตั้งขนาดของ renderer
      renderer.current.setClearColor(0xffffff, 1); // ตั้งสีพื้นหลังของ renderer
      canvasRef.current.appendChild(renderer.current.domElement); // แนบ DOM element ของ renderer ไปยัง canvasRef

      // ตั้งค่า scale ของโมเดล
      model.scale.set(10, 10, 10);

      // คำนวณตำแหน่งศูนย์กลางของโมเดลเพื่อจัดตำแหน่งให้พอดี
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      model.position.sub(center); // เลื่อนตำแหน่งของโมเดลให้อยู่กลาง
      camera.position.set(0, 0, size.length() * 0.6); // ตั้งตำแหน่งกล้อง

      // เพิ่มแสงสว่างให้กับโมเดล
      const ambientLight = new THREE.AmbientLight(0xffffff, 1); // แสงสว่างทั่วๆ ไป
      model.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // แสงสว่างทิศทาง
      directionalLight.position.set(10, 10, 10);
      model.add(directionalLight);

      // ฟังก์ชันสำหรับการเรนเดอร์และอนิเมชั่น
      const animate = function () {
        requestAnimationFrame(animate); // เรียกใช้ animate ซ้ำทุกๆ frame
        renderer.current.render(model, camera); // เรนเดอร์โมเดลด้วยกล้อง
      };

      animate(); // เรียกใช้ฟังก์ชันอนิเมชั่น

      // ฟังก์ชันที่จะเรียกเมื่อ component ถูกทำลาย
      return () => {
        renderer.current.dispose(); // เคลียร์ renderer
        if (canvasRef.current) {
          while (canvasRef.current.firstChild) {
            canvasRef.current.removeChild(canvasRef.current.firstChild); // ลบทุก child จาก canvasRef
          }
        }
      };
    }
  }, [model]); // ฟังก์ชันนี้จะทำงานเมื่อโมเดลเปลี่ยนแปลง

  return (
    <div 
      ref={canvasRef} // การอ้างอิงไปยัง div สำหรับ canvas
      onClick={onModelClick} // ฟังก์ชันคลิกที่รับมาจาก props
      style={{ width: '200px', height: '200px', cursor: 'pointer' }} // สไตล์ของ div
    >
    </div>
  );
}

export default GLTFView_RPD;
