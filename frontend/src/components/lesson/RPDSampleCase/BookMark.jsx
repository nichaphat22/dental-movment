import React, { useState, useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";
import "./RPD_sample_case.css";

function BookMark() {
  // สถานะเพื่อเก็บข้อมูลโมเดลที่ถูกบุ๊คมาร์ค
  const [bookmarkedModels, setBookmarkedModels] = useState([]);
  // ฟังก์ชันสำหรับนำทางไปยังเส้นทางอื่น
  const navigate = useNavigate();

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลโมเดลที่ถูกบุ๊คมาร์คจาก localStorage
    const fetchBookmarkedModels = async () => {
      // ดึงข้อมูลบุ๊คมาร์คจาก localStorage และแปลงเป็นอ็อบเจ็กต์
      const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
      // กรองชื่อโมเดลที่มีการบุ๊คมาร์ค
      const modelNames = Object.keys(savedBookmarks).filter(name => savedBookmarks[name]);

      // ดึงข้อมูล URL ของโมเดลทั้งหมดพร้อมกัน
      const modelsData = await Promise.all(
        modelNames.map(async (name) => {
          try {
            // ดึง URL ของโมเดลจาก Firebase Storage
            const url = await getDownloadURL(ref(storage, `models/${name}/model.gltf`));
            const patternUrl = await getDownloadURL(ref(storage, `models/${name}/pattern.patt`));
            const imageUrl = await getDownloadURL(ref(storage, `models/${name}/image.jpg`));
            // คืนค่าเป็นอ็อบเจ็กต์ที่ประกอบด้วยข้อมูลของโมเดล
            return { name, url, patternUrl, imageUrl };
          } catch (error) {
            console.error("Error fetching URL for model", name, ":", error);
            
            // หากเกิดข้อผิดพลาดในการดึงข้อมูล URL ของโมเดลให้ลบโมเดลนั้นออกจากบุ๊คมาร์ค
            const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
            delete savedBookmarks[name];
            localStorage.setItem('bookmarks', JSON.stringify(savedBookmarks));
            return null;
          }
        })
      );

      // กรองข้อมูลโมเดลที่ถูกต้อง (ไม่เป็น null)
      const validModelsData = modelsData.filter(model => model !== null);
      // อัปเดตสถานะด้วยข้อมูลโมเดลที่ถูกต้อง
      setBookmarkedModels(validModelsData);
    };

    // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลโมเดลที่ถูกบุ๊คมาร์ค
    fetchBookmarkedModels();
  }, []);

  // ฟังก์ชันสำหรับลบโมเดลออกจากรายการบุ๊คมาร์ค
  const handleRemoveBookmark = async (modelName) => {
    const confirmDelete = window.confirm(`ต้องการลบ ${modelName} ออกจากรายการโปรดใช่ไหม?`);
    if (confirmDelete) {
      try {
        // ดึงข้อมูลบุ๊คมาร์คจาก localStorage
        const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
        // ลบชื่อโมเดลออกจากบุ๊คมาร์ค
        delete savedBookmarks[modelName];
        localStorage.setItem('bookmarks', JSON.stringify(savedBookmarks));
        // อัปเดตสถานะเพื่อกำจัดโมเดลที่ถูกลบออกจาก UI
        setBookmarkedModels(prevModels => prevModels.filter(model => model.name !== modelName));
      } catch (error) {
        console.error("Error removing bookmark:", error);
      }
    }
  };

  // ฟังก์ชันสำหรับจัดการการคลิกที่โมเดล
  const handleModelClick = (name, url, patternUrl) => {
    navigate(`/Model/${name}/view`, {
      state: { selectedModel: { name, url, patternUrl } },
    });
  };

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <h1 className="title-h1">รายการโปรด</h1>
      <div className="grid-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* แสดงรายการโมเดลที่ถูกบุ๊คมาร์ค */}
        {bookmarkedModels.map((model) => (
          <div className="modelrow" key={model.name} style={{ width: '200px', maxHeight: '240px' }}>
            <img
             className="img-model"
              src={model.imageUrl} 
              alt={model.name} 
              style={{ cursor:'pointer', width: '100%', height: 'auto', objectFit: 'cover' }}
              onClick={() => handleModelClick(model.name, model.url, model.patternUrl)}
            />
            <div className="model-container" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ marginLeft: '10px', fontSize: "0.95rem", color: "#000", fontWeight: '500'  }}>{model.name}</span>
              <button className="remove" onClick={() => handleRemoveBookmark(model.name)}>ลบ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookMark;
