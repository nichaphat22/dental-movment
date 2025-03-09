import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { useNavigate } from "react-router-dom";
// import {   } from "react-bootstrap";
import { Card, Button, Row, Col,Container,Spinner,Dropdown, ButtonGroup,  } from 'react-bootstrap';
import { baseUrl } from '../../../utils/services';
import { HiPlusSm } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { VscKebabVertical } from "react-icons/vsc";

function View_Biomechanical_consideration() {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const [showButtons, setShowButtons] = useState(false);
  useEffect(() => {
    fetchAnimations();
  }, []);

  const fetchAnimations = () => {
    axios
      .get(`${baseUrl}/animation/getAnimation`)
      .then((response) => {
        setAnimations(response.data);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  };

  const goToEditPage = (id) => {
    navigate(`/Edit-Biomechanical-consideration/${id}`);
  };

  const removeAnimation = (id) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบอนิเมชันนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          axios
            .delete(`http://localhost:8080/api/animation/deleteAnimation/${id}`)
            .then((response) => {
              setAnimations(animations.filter((animation) => animation._id !== id));
            });
          Swal.fire("ลบสำเร็จ!", "อนิเมชันถูกลบเรียบร้อยแล้ว", "success");
        } catch (error) {
          console.error("Error deleting model:", error);
          Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบอนิเมชันได้", "error");
        }
      } else {
        console.log("Deletion canceled");
      }
    });
  };

  const handleAddAnimation = () => {
    navigate(`/Add-Biomechanical-consideration`);
  };

  const handleImageClick = (id) => {
    navigate(`/animation/view/${id}`);
  };

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <ToastContainer />
      <h1 className="title-h1">Biomechanical consideration</h1>

      <div className="flex justify-between my-2 mx-4">
        <div className="title ">Mechanical force</div>
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleAddAnimation}
        >
          <HiPlusSm className="w-5 h-5 mr-2" />
          เพิ่มสื่อการสอน
        </button>
      </div>

      <Container>
        {loading ? ( // Show loading spinner while data is loading
          <div className="d-flex justify-content-center my-5" style={{}}>
            {/* animation="grow" */}
            <Spinner animation="border" style={{color:'rgb(172, 78, 235)'}} />
          </div>
        ) : (
          <Row>
            {animations.map((animation) => (
              <Col xs={12} sm={6} md={6} lg={3} className="mb-4" key={animation._id}>
                <div className="animationid" style={{ textAlign: 'center', justifyItems: 'center' }}>
                  <div className="ani" style={{ boxShadow: '0 0 5px 2px rgba(0, 0, 0, 0.075)', paddingBottom: '15px' }}>
                    <img
                      className="img_ani"
                      title="คลิกเพื่อเล่นวิดีโอ"
                      onClick={() => handleImageClick(animation._id)}
                      src={`data:${animation.Ani_image.contentType};base64,${animation.Ani_image.data}`}
                      alt={animation.Ani_name}
                      style={{ cursor: "pointer", borderRadius: '10px' }}
                    />
                    <div className="nameandbt">
                      <h3 className="Ani_name" title={animation?.Ani_name}>
                        {animation?.Ani_name}
                      </h3>
                      <Dropdown as={ButtonGroup}>
                      <Dropdown.Toggle  id="dropdown-custom-components" className="no-arrow" >
        <VscKebabVertical />
      </Dropdown.Toggle>

      <Dropdown.Menu className="dwMenu" >
        <Dropdown.Item className="btEdit" onClick={() => goToEditPage(animation._id)} title="แก้ไขแอนิเมชัน">
          แก้ไข
        </Dropdown.Item>
        <Dropdown.Item className="btDelete" onClick={() => removeAnimation(animation._id)} title="ลบแอนิเมชัน">
          ลบ
        </Dropdown.Item>
      </Dropdown.Menu>
      </Dropdown>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default View_Biomechanical_consideration;
