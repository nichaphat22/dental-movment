import React, { useState, useContext, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../../../config/firebase"; // ใช้การตั้งค่าของ Firebase Realtime Database
import { useNavigate } from "react-router-dom";
import "./RPD_sample_case.css";
import axios from "axios"; // นำเข้า axios
// import { baseUrl } from "../../../utils/services";
import { AuthContext } from '../../../context/AuthContext';
import { Card, Button, Row, Col,Container } from 'react-bootstrap';
import { RiDeleteBin6Line } from "react-icons/ri";
// import bk1 from '../../../../public/bookmark1.png'
import bk from '../../../../public/bookmark.png'




function BookMark() {
  const [bookmarkedModels, setBookmarkedModels] = useState([]);
  const navigate = useNavigate();
    const [clickedBookmark, setClickedBookmark] = useState({});
  const { user } = useContext(AuthContext);

  // ฟังก์ชันสำหรับดึงข้อมูลโมเดลที่ถูกบุ๊คมาร์ค
  const fetchBookmarkedModels = async () => {
    if (!user?._id) {
      console.error('User ID is not available');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/api/bookmark/${user._id}`);
  
      // ตรวจสอบว่า response มีข้อมูลบุ๊คมาร์คหรือไม่
      if (!response.data) {
        console.error("Error: No bookmarks data found", response.data);
        return;
      }
  
      const bookmarksData = response.data;
  
      // คัดกรองเฉพาะโมเดลที่บุ๊คมาร์ค (ค่าที่เป็น true)
      const filteredBookmarks = Object.entries(bookmarksData)
        .filter(([_, isBookmarked]) => isBookmarked) // คัดกรองเฉพาะที่เป็น true
        .map(([name]) => name);
  
      // ถ้าไม่มีข้อมูลบุ๊คมาร์คก็ออกจากฟังก์ชัน
      if (filteredBookmarks.length === 0) {
        console.warn("No valid bookmarked models found.");
        setBookmarkedModels([]); // ตั้งค่ารายการโมเดลเป็นค่าว่าง
        return;
      }

      // ดึงข้อมูลจาก Firebase Realtime Database
      const modelsRef = ref(database, 'models'); // เส้นทางที่เก็บข้อมูลโมเดลใน Realtime Database
      const modelsSnapshot = await get(modelsRef);
      
      if (!modelsSnapshot.exists()) {
        console.error("Error: No models data found in database");
        return;
      }

      const modelsData = modelsSnapshot.val();
      
      // คัดกรองเฉพาะโมเดลที่ถูกบุ๊คมาร์คจากฐานข้อมูล
      const modelsWithUrls = filteredBookmarks.map((modelId) => {
        const model = modelsData[modelId];
        if (model) {
          return {
            id: model.id,
            name: model.name,
            url: model.url || '',
            patternUrl: model.patternUrl || '',
            imageUrl: model.imageUrl || ''
          };
        }
        return null;
      }).filter(model => model !== null); // ลบข้อมูลที่เป็น null ออก

      // ตั้งค่ารายการโมเดลที่ถูกบุ๊คมาร์ค
      setBookmarkedModels(modelsWithUrls);
    } catch (error) {
      console.error("Error fetching bookmarked models:", error);
    }
  };

  // useEffect สำหรับดึงข้อมูลเมื่อมีการเปลี่ยนแปลง user
  useEffect(() => {
    if (user?._id) {
      fetchBookmarkedModels(); // เรียกใช้ฟังก์ชันดึงข้อมูล
    }
  }, [user]); // useEffect นี้จะทำงานเมื่อ user เปลี่ยนแปลง

  // ฟังก์ชันสำหรับจัดการการคลิกที่โมเดล
  const handleModelClick = (name, url, patternUrl) => {
    navigate(`/Model/${name}/view`, {
      state: { selectedModel: { name, url, patternUrl } },
    });
  };

  // const fetchBookmarks = async (userId) => {
  //   try {
  //     const response = await axios.get(`${baseUrl}/bookmark/${userId}`);
  //     setClickedBookmark(response.data || {});
  //   } catch (error) {
  //     console.error("Error fetching bookmarks:", error);
  //   }
  // };

  // const handleBookmarkClick = async (userId, modelId) => {
  //   if (!userId) {
  //     console.error("Invalid userId:", userId);
  //     return;
  //   }
  
  //   const updatedBookmarks = {
  //     ...clickedBookmark,
  //     [modelId]: !clickedBookmark[modelId], // ใช้ id แทนชื่อ
  //   };
  
  //   setClickedBookmark(updatedBookmarks);
  
  //   try {
  //     await axios.post(`${baseUrl}/bookmark/${userId}`, {
  //       userId,
  //       bookmarks: updatedBookmarks,
  //     });
  //     setBookmarkedModels(prevModels => prevModels.filter(model => model.id !== modelId)); // ใช้ model.id แทน model.name
  //     fetchBookmarks(userId);
  //   } catch (error) {
  //     console.error("Error updating bookmarks:", error);
  //   }
  // };


  const handleRemoveBookmark = async (modelId,modelName) => {
    // const confirmDelete = window.confirm(`ต้องการลบ ${modelName} ออกจากรายการโปรดใช่ไหม?`);
    // if (confirmDelete) {
      try {
        // Send a DELETE request with the correct modelId
        await axios.delete(`http://localhost:8080/api/bookmark/remove-bookmark/${user._id}/${modelId}`);
        
        // Update UI to remove the model using modelId
        setBookmarkedModels(prevModels => prevModels.filter(model => model.id !== modelId)); // ใช้ model.id แทน model.name
      } catch (error) {
        console.error("Error removing bookmark:", error);
      }
    // }
  };

  
  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <h1 className="title-h1">รายการโปรด</h1>
      {/* <div className="grid-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}> */}
      <Container className="container">
      <Row >
        {bookmarkedModels.map((model) => (
         
        <Col xs={12} sm={6} md={6} lg={3} className="mb-4" key={model.name} style={{ }}>
           <div className="modelrow-bookmark  h-100"style={{}}>
          <div className="model-bk2">
          <button 
                  title="บันทึกเป็นรายการโปรด"
                  className="bookmark" onClick={() => handleRemoveBookmark(model.id, model.name)}>
                  <img 
  className="img-bookmark"
  src={bk}
  alt="bookmark"
  style={{ minWidth: "28px", minHeight: "28px", height: "28px", width: "28px" }}
/>

                  </button>
          {/* <button title="ลบออกจากรายการโปรด" className="remove-bookmark" onClick={() => handleRemoveBookmark(model.id,model.name)}><RiDeleteBin6Line/></button> */}
            <img
              className="img-bookmark"
              src={model.imageUrl} 
              alt={model.name} 
              style={{ cursor: 'pointer', width: '100%',height:'20vh' }}
              onClick={() => handleModelClick(model.name, model.url, model.patternUrl)}
            />
            <div className="model-container h-100" style={{height:'70px', display:'flex',}}>
              <span className="modelName-span" style={{ margin: '10px 0 10px 0', fontSize: "0.85rem", color: "#000", fontWeight: '500' , wordBreak:'break-all'}}>{model.name}</span>
           
            </div>
            </div>
            </div>
            </Col>
        ))}
        </Row>
        </Container>
      </div>
  );
}

export default BookMark;
