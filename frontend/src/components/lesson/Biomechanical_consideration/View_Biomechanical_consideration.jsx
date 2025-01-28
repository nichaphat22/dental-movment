import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col } from 'react-bootstrap';
import { baseUrl } from '../../../utils/services';
import { HiPlusSm } from "react-icons/hi";

function View_Biomechanical_consideration() {
  const [animations, setAnimations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimations();
  }, []);

  const fetchAnimations = () => {
    axios
      .get(`${baseUrl}/animation/getAnimation`)
      .then((response) => {
        setAnimations(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const goToEditPage = (id) => {
    navigate(`/Edit-Biomechanical-consideration/${id}`);
  };

  const removeAnimation = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this animation?");
    if (confirmDelete) {
      axios
        .delete(`http://localhost:8080/api/animation/deleteAnimation/${id}`)
        .then((response) => {
          setAnimations(animations.filter((animation) => animation._id !== id));
          alert("Animation deleted successfully!");
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to delete animation.");
        });
    }
  };

  const handleAddAnimation = () => {
    navigate(`/Add-Biomechanical-consideration`);
  };

  const handleImageClick = (id) => {
    navigate(`/animation/view/${id}`);
  };

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <h1 className="title-h1">Biomechanical consideration</h1>

      <div className="flex justify-between my-2 mx-4 ">
      {/* <h1 className="my-2 text-xl font-semibold">การเคลื่อนที่ของฟันเทียม</h1> */}
      
      <div className="title my-2 mx-4 ">Mechanical force</div>
      <button 
        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleAddAnimation}>
        <HiPlusSm className="w-5 h-5 mr-2" />
        เพิ่มสื่อการสอน
      </button>
      </div>
      <Row>
        {animations.map((animation) => (
          <Col sm={6} md={4} lg={3} className="mb-4" key={animation._id}>
            <div className="animationid" style={{ textAlign: 'center' }}>
              <img
              title="คลิกเพื่อเล่นวิดีโอ"
                onClick={() => handleImageClick(animation._id)}
                src={`data:${animation.Ani_image.contentType};base64,${animation.Ani_image.data}`}
                alt={animation.Ani_name}
                width="100%"
                max-height="120px"
                style={{  cursor: "pointer" }}
              />
              <h3 className="Ani_name">{animation.Ani_name}</h3>
             <div className="bt">
             <Button className="button-edit-ani" onClick={() => goToEditPage(animation._id)}>แก้ไข</Button>
             <Button className="button-remove-ani" onClick={() => removeAnimation(animation._id)}>ลบ</Button>
             </div>
             
            </div>
          </Col>
        ))}
      </Row>
      {/* <div style={{ display: 'flex', marginBottom: "20px", marginTop: '20px', justifyContent: 'center' }}>
        <button className="button-add" onClick={handleAddAnimation}>
          <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
          </svg>
        </button>
      </div> */}
    </div>
  );
}

export default View_Biomechanical_consideration;
