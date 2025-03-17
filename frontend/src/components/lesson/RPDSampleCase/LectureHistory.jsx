import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LectureModal from './LectureModal';
// import { baseUrl } from '../../../utils/services';
import { AuthContext } from '../../../context/AuthContext';
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { Card, Button, Row, Col,Container } from 'react-bootstrap';
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RiDeleteBin5Fill } from "react-icons/ri";


const LectureHistory = () => {
  // Hook สำหรับการนำทาง
  const navigate = useNavigate();
  // State สำหรับเก็บข้อมูลรายการบรรยาย
  const [lectures, setLectures] = useState([]);
  // State สำหรับเก็บข้อมูลบรรยายที่เลือก
  const [selectedLecture, setSelectedLecture] = useState(null);
  // Context สำหรับดึงข้อมูลผู้ใช้ที่ล็อกอิน
  const { user } = useContext(AuthContext);

  // ฟังก์ชันสำหรับดึงข้อมูลบรรยายจากเซิร์ฟเวอร์
  const fetchLectures = async (userLectureID) => {
    try {
      if (!userLectureID) {
        console.error('No userLectureID provided'); // ตรวจสอบว่า ID ผู้ใช้ถูกส่งมา
        return;
      }
      const response = await axios.get(`http://localhost:8080/api/lecture/${userLectureID}`); // ดึงข้อมูลบรรยาย
      setLectures(response.data); // ตั้งค่าข้อมูลบรรยายใน state
    } catch (error) {
      console.error('Error fetching lectures:', error); // จัดการข้อผิดพลาด
    }
  };
  
  // ใช้ useEffect เพื่อตรวจสอบและดึงข้อมูลเมื่อ component ถูกเรนเดอร์
  useEffect(() => {
    if (user?._id) {
      fetchLectures(user._id); // ดึงข้อมูลบรรยายตาม ID ของผู้ใช้
    } else {
      console.error('User ID is not available'); // ข้อความเมื่อ ID ผู้ใช้ไม่มี
    }
  }, [user]); // ใช้ user เป็น dependency ของ useEffect

  // ฟังก์ชันจัดการการคลิกที่ภาพขนาดย่อ
  const handleThumbnailClick = (lecture) => {
    setSelectedLecture(lecture); // ตั้งค่าบรรยายที่เลือก
  };

  // ฟังก์ชันจัดการการคลิกปุ่มลบ
  const handleDeleteClick = async (id) => {

     // แสดง Swal เพื่อขอการยืนยันจากผู้ใช้
      Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณต้องการลบรูปภาพนี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            
    // try {
      await axios.delete(`http://localhost:8080/api/lecture/lectures/${id}`); // ลบบรรยายตาม ID
      fetchLectures(user._id); // ดึงข้อมูลบรรยายใหม่หลังจากลบ
  //  / แสดงข้อความสำเร็จหลังจากการลบ
           Swal.fire("ลบสำเร็จ!", "รูปภาพถูกลบเรียบร้อยแล้ว", "success");
   
         } catch (error) {
           console.error("Error deleting model:", error);
           Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถรูปภาพได้", "error");
         }
        } else {
          console.log("Deletion canceled");
        }
      });
    };
  
  // ฟังก์ชันปิด modal
  const closeModal = () => {
    setSelectedLecture(null); // รีเซ็ต state ของบรรยายที่เลือก
  };

  return (
    <div className="lecture-history" style={{position:'relative',}}>
             <ToastContainer  />  
      <h1 className="title-h1-lect" style={{}}>Lecture History</h1>
      <div className="lecture-thumbnails" style={{ display: 'flex', flexWrap: 'wrap', textAlign: 'center', justifyContent: 'center',width:'100%',margin:'auto' }}>
        
      <Container className="container-lect" style={{}}>
      <Row style={{ }}>

        {lectures.map((lecture) => (
          
          <Col xs={12} sm={6} md={6} lg={3} xl={3} className="mb-4" 
            key={lecture._id} >
              <div 
            className="thumbnail-container" 
            style={{ 
              // border: '1px solid #f3f3f3', 
              // boxShadow: 'hsla(221, 10.40%, 30.20%, 0.25) 0px 1px 1px, rgba(213, 218, 226, 0.13) 0px 0px 1px 1px',
              borderRadius: '0', 
              position: 'relative', 
              // padding: '16px', 
              marginBottom: '20px', 
              justifyContent: 'center', 
              textAlign: 'center', 
              border:'1px solid #b1b1b1'
            }}
          >
             <button 
             className='delete-lect'
              onClick={() => handleDeleteClick(lecture._id)} 
              style={{ 
                border: 'none' ,
                padding:'5px',
                  border: 'none',
                  padding: '5px',
                  position: 'absolute',
                  top: '3px' ,
                  right: '3px'  ,   
                  zIndex: '10'   ,     
                  cursor: 'pointer'     ,
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius:'5px'
              
                // float:'right'
              }}
            >
              <RiDeleteBin5Line className='deleteiimg-icon' size={18} style={{color:'#393939'}}/>
            </button>
            {/* <br /> */}
            {lecture.img ? (
              <img 
                src={lecture.img} 
                alt="Lecture thumbnail" 
                width="100%" 
                style={{ borderRadius: '0', cursor: 'pointer' }} 
                onClick={() => handleThumbnailClick(lecture)} 
              />
            ) : (
              <p>No image available</p> // ข้อความเมื่อไม่มีภาพ
            )}
            {/* <br /> */}
           </div>
          </Col>
        ))}
        </Row>
        </Container>
      </div>
      {selectedLecture && <LectureModal lecture={selectedLecture} onClose={closeModal} />} 
      {/* แสดง modal เมื่อมีบรรยายที่เลือก */}
    </div>
  );
};

export default LectureHistory;
