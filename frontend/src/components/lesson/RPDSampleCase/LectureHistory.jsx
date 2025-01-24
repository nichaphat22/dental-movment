import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LectureModal from './LectureModal';
import { baseUrl } from '../../../utils/services';
import { AuthContext } from '../../../context/AuthContext';

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
      const response = await axios.get(`${baseUrl}/lecture/${userLectureID}`); // ดึงข้อมูลบรรยาย
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
    const isConfirmed = window.confirm('Are you sure you want to delete this lecture?'); // ยืนยันการลบ
  
    if (!isConfirmed) {
      return; // ออกจากฟังก์ชันหากผู้ใช้ยกเลิก
    }
  
    try {
      await axios.delete(`${baseUrl}/lecture/lectures/${id}`); // ลบบรรยายตาม ID
      fetchLectures(user._id); // ดึงข้อมูลบรรยายใหม่หลังจากลบ
    } catch (error) {
      console.error('Error deleting lecture:', error); // จัดการข้อผิดพลาด
    }
  };
  
  // ฟังก์ชันปิด modal
  const closeModal = () => {
    setSelectedLecture(null); // รีเซ็ต state ของบรรยายที่เลือก
  };

  return (
    <div className="lecture-history">
      <h1 className="title-h1">Lecture History</h1>
      <div className="lecture-thumbnails" style={{ display: 'flex', flexWrap: 'wrap', textAlign: 'center', justifyContent: 'center' }}>
        {lectures.map((lecture) => (
          <div 
            key={lecture._id} 
            className="thumbnail-container" 
            style={{ 
              border: '1px solid #f3f3f3', 
              boxShadow: '0 0 50px 2px rgba(0, 0, 0, 0.05)', 
              borderRadius: '20px', 
              padding: '20px', 
              margin: '10px', 
              marginBottom: '20px', 
              justifyContent: 'center', 
              textAlign: 'center' 
            }}
          >
            {lecture.img ? (
              <img 
                src={lecture.img} 
                alt="Lecture thumbnail" 
                width="150px" 
                style={{ borderRadius: '0', cursor: 'pointer' }} 
                onClick={() => handleThumbnailClick(lecture)} 
              />
            ) : (
              <p>No image available</p> // ข้อความเมื่อไม่มีภาพ
            )}
            <br />
            <button 
              onClick={() => handleDeleteClick(lecture._id)} 
              style={{ 
                backgroundColor: 'red', 
                color: '#fff', 
                borderRadius: '5px', 
                marginTop: '5px', 
                border: 'none' 
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {selectedLecture && <LectureModal lecture={selectedLecture} onClose={closeModal} />} 
      {/* แสดง modal เมื่อมีบรรยายที่เลือก */}
    </div>
  );
};

export default LectureHistory;
