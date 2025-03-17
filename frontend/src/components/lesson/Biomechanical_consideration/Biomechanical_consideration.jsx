import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Biomechanical_consideration.css";
// import { baseUrl } from '../../../utils/services';
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
// import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Input, } from '@chakra-ui/react';
import { RxCross2 } from "react-icons/rx";
import { HiUpload } from "react-icons/hi"
import { TbFile } from "react-icons/tb";

function BiomechanicalConsideration() {
  const [Ani_name, setAniName] = useState("");
  const [Ani_animation, setAniAnimation] = useState(null);
  const [Ani_description, setAniDescription] = useState("");
  const [Ani_image, setAniImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleAnimationNameChange = (event) => setAniName(event.target.value);
  const handleAnimationDescriptionChange = (event) => setAniDescription(event.target.value);
  const handleFileChange = (event) => setAniAnimation(event.target.files[0]);
  const handleImageChange = (event) => setAniImage(event.target.files[0]);

  const handleAddAnimation = async (event) => {
    event.preventDefault();



    const formData = new FormData();
    formData.append("Ani_name", Ani_name);
    formData.append("Ani_description", Ani_description);
    formData.append("Ani_animation", Ani_animation);
    formData.append("Ani_image", Ani_image);

// ตรวจสอบว่าไฟล์และชื่อโมเดลครบถ้วน
// ตรวจสอบว่าไฟล์และชื่อโมเดลครบถ้วน
if (!Ani_name  || !Ani_description  || !Ani_animation || !Ani_image) {
  toast.error("กรุณากรอกข้อมูลให้ครบถ้วน", {
    position: "top-right",
    autoClose: 2000,
    theme: "light",
    transition: Flip,
  });
  return;
}

    setUploading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/animation/saveAnimation',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
       // แจ้งเตือนเมื่อเพิ่มโมเดลสำเร็จ
       Swal.fire({
        title: "เพิ่มอนิเมชันสำเร็จ!",
        text: "อนิเมชันของคุณถูกเพิ่มเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      }).then((result) => {
        if (result.isConfirmed) {
          // เมื่อผู้ใช้กด "ตกลง" จะทำการนำทางไปยังหน้าถัดไป
          navigate('/Biomechanical-consideration');
        }
      });
    }catch (error) {
        console.error("ไม่สามารถบันทึกโมเดลได้", error);
        setUploading(false);
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          transition: Flip,
        });
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกโมเดลได้", "error");
      }
  };

  // ฟังก์ชันเพื่อกลับไปหน้าก่อนหน้า
  const handleCancel = () => {
     Swal.fire({
              title: "คุณแน่ใจหรือไม่?",
              text: "การยกเลิกจะไม่บันทึกข้อมูลที่คุณแก้ไขไว้!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "ใช่, ยกเลิก",
              cancelButtonText: "ไม่, กลับไปแก้ไข",
            }).then((result) => {
              if (result.isConfirmed) {
                // ถ้าผู้ใช้กดยืนยันให้เปลี่ยนเส้นทาง
                navigate('/Biomechanical-consideration');
              }
            });
    // ย้อนกลับไปยังหน้าที่แล้วในประวัติการเรียกดู
  };
  // ฟังก์ชันในการลบไฟล์
  const handleDeleteFile = (fileType) => {
    if (fileType === 'Ani_image') {
      setAniImage(null);
    } else if (fileType === 'Ani_animation') {
      setAniAnimation(null);
    }
  };

  return (
    <div className="Content">
            <ToastContainer  />  
      <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <div className="Content" style={{ margin: '20px' }}>
        <h1 style={{ margin: '0', fontSize: '1.5rem',marginBottom:'15px' }}>เพิ่มแอนิเมชัน</h1>

        <form onSubmit={handleAddAnimation}>
        <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_name" className="lebel-bio">ชื่อแอนิเมชัน : <span style={{color:'red'}}>*</span></label>
          <br />
          <textarea
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              height: '45px',
              resize: 'none',
              background: '#f5f5f5',
              overflow: 'hidden'
            }}
            wrap="soft"
            value={Ani_name}
            onChange={(e) => {
              handleAnimationNameChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            // required
          />
          </div>
          {/* <br /> */}
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_description" className="lebel-bio">รายละเอียดแอนิเมชัน : <span style={{color:'red'}}>*</span></label>
          <br />
          <textarea
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              height: '45px',
              resize: 'none',
              background: '#f5f5f5',
              overflow: 'hidden'
            }}
            wrap="soft"
            value={Ani_description}
            onChange={(e) => {
              handleAnimationDescriptionChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            // required
          />
          </div>
          {/* <br /> */}

          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_animation" className="lebel-bio">ไฟล์แอนิเมชัน : <span style={{color:'red'}}>* </span><span style={{color:'red',fontWeight:'400',fontSize:'0.85rem'}}></span></label>
          <br />
          <Input
            type="file"
            name="Ani_animation"
            className="choose-file"
            id="Ani_animation"
            accept="video/*"
            display="none" // ซ่อน input
            onChange={handleFileChange}
            />
         <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom:'5px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  padding: '10px',
                  background: 'rgb(145, 54, 205)',
                  color: '#fff',
                  boxShadow: 'rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset'
                }}
                onClick={() => document.querySelector('#Ani_animation').click()} // คลิก input เมื่อคลิกปุ่ม
              >
                <HiUpload /> อัปโหลดไฟล์
              </Button>
          
              {Ani_animation && (
                <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
                  <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                    <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
                    <div>
                      <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{Ani_animation.name}</div>
                      <div style={{ fontSize: '12px', color: '#444444' }}> {Ani_animation.size ? (Ani_animation.size / (1024 * 1024)).toFixed(2) + " MB" : "ขนาดไฟล์ไม่ถูกต้อง"}</div>
                    </div>
                  </div>
                  {/* ปุ่มลบไฟล์ */}
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      marginLeft: 'auto' // ช่วยให้ปุ่มไปที่ขวาสุด
                    }}
                    onClick={() => handleDeleteFile('Ani_animation')}
                  >
                    <RxCross2 color='#52525b'/>
                  </Button>
                  </div>
    )}
  </div>
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_image" className="lebel-bio">ไฟล์รูปภาพหน้าปกแอนิเมชัน : <span style={{color:'red'}}>*</span></label>
          <br />
          <Input
            type="file"
            name="Ani_image"
            className="choose-file"
            id="Ani_image"
            accept="image/*"
            onChange={handleImageChange}
            display="none" // ซ่อน input
            // required
          />
           <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom:'5px',
                  fontSize: '14px',
                  borderRadius: '5px',
                  padding: '10px',
                  background: 'rgb(145, 54, 205)',
                  color: '#fff',
                  boxShadow: 'rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset'
                }}
                onClick={() => document.querySelector('#Ani_image').click()} // คลิก input เมื่อคลิกปุ่ม
              >
                <HiUpload /> อัปโหลดไฟล์
              </Button>
          
              {Ani_image && (
                <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
                  <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                    <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
                    <div>
                      <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{Ani_image.name}</div>
                      <div style={{ fontSize: '12px', color: '#444444' }}> {Ani_image.size ? (Ani_image.size / (1024 * 1024)).toFixed(2) + " MB" : "ขนาดไฟล์ไม่ถูกต้อง"}</div>
                    </div>
                  </div>
                  {/* ปุ่มลบไฟล์ */}
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      marginLeft: 'auto' // ช่วยให้ปุ่มไปที่ขวาสุด
                    }}
                    onClick={() => handleDeleteFile('Ani_image')}
                  >
                    <RxCross2 color='#52525b'/>
                  </Button>
                  </div>
    )}
  </div>
      
          <button type="button" className="cancel-button" onClick={handleCancel}>
            ยกเลิก
          </button>
          <button type="submit" className="add-button">
            บันทึก
          </button>
          
        </form>
{/* 
        {uploading && (
          <div style={{ marginLeft: '20px' }}>
            <div className={`upload-status ${uploadProgress < 100 ? "uploading" : "completed"}`}>
              Status: {uploadProgress < 100 ? "Uploading" : "Completed"}
            </div>
            <div>Progress: {uploadProgress < 100 ? `${uploadProgress.toFixed(2)}%` : "100%"}</div>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default BiomechanicalConsideration;
