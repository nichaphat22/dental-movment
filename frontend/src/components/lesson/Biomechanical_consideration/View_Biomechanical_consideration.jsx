import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col,Container } from 'react-bootstrap';
import { baseUrl } from '../../../utils/services';
import { HiPlusSm } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

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
    // const confirmDelete = window.confirm("Are you sure you want to delete this animation?");
    // if (confirmDelete) {
      axios
        .delete(`http://localhost:8080/api/animation/deleteAnimation/${id}`)
        .then((response) => {
          setAnimations(animations.filter((animation) => animation._id !== id));
          // alert("Animation deleted successfully!");
        })
      // แสดงข้อความสำเร็จหลังจากการลบ
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
        <ToastContainer  />  
      <h1 className="title-h1" >Biomechanical consideration</h1>

      <div className="flex justify-between my-2 mx-4 ">
      {/* <h1 className="my-2 text-xl font-semibold">การเคลื่อนที่ของฟันเทียม</h1> */}
      
      <div className="title ">Mechanical force</div>
      <button 
        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleAddAnimation}>
        <HiPlusSm className="w-5 h-5 mr-2" />
        เพิ่มสื่อการสอน
      </button>
      </div>
      <Container>
      <Row>
        {animations.map((animation) => (
          <Col xs={12} sm={6} md={6} lg={3}  className="mb-4" key={animation._id}>
            <div className="animationid" style={{ textAlign: 'center',justifyItems:'center' }}>
             <div className="ani" style={{boxShadow:'box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.075)',paddingBottom:'15px'}}>
              <img
              className="img_ani"
              title="คลิกเพื่อเล่นวิดีโอ"
                onClick={() => handleImageClick(animation._id)}
                src={`data:${animation.Ani_image.contentType};base64,${animation.Ani_image.data}`}
                alt={animation.Ani_name}
      
                style={{  cursor: "pointer",borderRadius:'10px' }}
              />
            
             <div className="nameandbt">
             <h3 className="Ani_name" title={animation?.Ani_name}>
  {animation?.Ani_name}
</h3>

             <sapan className="bt" style={{}}>
             <Button className="button-edit-ani" title="แก้ไขแอนิเมชัน" onClick={() => goToEditPage(animation._id)}>แก้ไข</Button>
             <Button className="button-remove-ani" title="ลบแอนิเมชัน" onClick={() => removeAnimation(animation._id)}>ลบ</Button>
         
            {/* <Button className="button-edit-ani" title="แก้ไขแอนิเมชัน" onClick={() => goToEditPage(animation._id)}><MdEdit/></Button>
             <Button className="button-remove-ani" title="ลบแอนิเมชัน" onClick={() => removeAnimation(animation._id)}><RiDeleteBin6Line/></Button> */}
          
             </sapan>
             </div>
             </div>
            </div>
          </Col>
        ))}
      </Row>
      </Container>
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
