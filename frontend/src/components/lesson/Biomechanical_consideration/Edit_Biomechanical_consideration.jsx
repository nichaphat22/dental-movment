import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { useParams } from "react-router-dom";
// import { baseUrl } from '../../../utils/services';
import { useNavigate } from "react-router-dom";
import { toast, Flip, ToastContainer } from "react-toastify";
// import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
// import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Input, } from '@chakra-ui/react';
import { RxCross2 } from "react-icons/rx";
import { HiUpload } from "react-icons/hi"
import { TbFile } from "react-icons/tb";
import { Card, Row, Col,Container,Spinner  } from 'react-bootstrap';


function Edit_Biomechanical_consideration() {
  const { id } = useParams();

  const [newAnimationName, setNewAnimationName] = useState("");
  const [newAnimationDescription, setNewAnimationDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingAnimation, setExistingAnimation] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // เก็บข้อมูลเดิมไว้เพื่อตรวจสอบการเปลี่ยนแปลง
  const [originalAnimationName, setOriginalAnimationName] = useState("");
  const [originalAnimationDescription, setOriginalAnimationDescription] = useState("");
  const [originalAnimation, setOriginalAnimation] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง
  const nameRef = useRef(null);
  const descriptionRef = useRef(null);
  const [loading, setLoading] = useState(true); // Loading state


  useEffect(() => {
    if (id) {
      axios.get(`/api/animation/getAnimationById/${id}`)
        .then(response => {
          const { Ani_name, Ani_description, Ani_animation, Ani_image } = response.data;
          setNewAnimationName(Ani_name);
          setNewAnimationDescription(Ani_description);
          setExistingAnimation(Ani_animation);
          setExistingImage(Ani_image);

          // เก็บข้อมูลเดิม
          setOriginalAnimationName(Ani_name);
          setOriginalAnimationDescription(Ani_description);
          setOriginalAnimation(Ani_animation );
          setOriginalImage(Ani_image);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setLoading(false);
        });
    } else {
      console.error('ID is null or undefined');
    }
  }, [id]);

  const handleAnimationNameChange = (event) => {
    setNewAnimationName(event.target.value);
  };

  const handleAnimationDescriptionChange = (event) => {
    setNewAnimationDescription(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file); // ไม่ต้องแปลงเป็น base64
  };
  useEffect(() => {
    if (existingAnimation) {
      setSelectedFile(existingAnimation); // ถ้ามีไฟล์เก่าให้ตั้งค่าให้กับ selectedFile
    }
  }, [existingAnimation]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file); // ไม่ต้องแปลงเป็น base64
  };

  useEffect(() => {
    if (existingImage) {
      setSelectedImage(existingImage); // ถ้ามีไฟล์เก่าให้ตั้งค่าให้กับ selectedFile
    }
    
  }, [existingImage]);

  const handleUpdateAnimation = () => {
    try {
      if (!id) {
        console.error("ID is null or undefined");
        return;
      }

      // ตรวจสอบว่ามีการเปลี่ยนแปลงข้อมูลหรือไม่
      const isDataChanged =
        newAnimationName !== originalAnimationName ||
        newAnimationDescription !== originalAnimationDescription ||
        selectedFile ||
        selectedImage;

      // if (!isDataChanged) {
      //   alert("You haven't made any changes to the data.");
      //   return;
      // }


      const formData = new FormData();
  // ถ้าไม่มีการเปลี่ยนแปลงใดๆ ก็ไม่ต้องทำอะไร
  if (!isDataChanged) {
    Swal.fire({
      title: "คุณยังไม่ได้ทำการแก้ไขข้อมูล",
      icon: "info",
      confirmButtonText: "ตกลง",
    });
    return; // หยุดการทำงานหากไม่มีการเปลี่ยนแปลง
  }
  // ตรวจสอบและส่งเฉพาะค่าที่เปลี่ยนแปลง
if (newAnimationName !== originalAnimationName) {
  formData.append("Ani_name", newAnimationName);
}

if (newAnimationDescription !== originalAnimationDescription) {
  formData.append("Ani_description", newAnimationDescription);
}

// ตรวจสอบเฉพาะไฟล์ใหม่ที่ถูกเลือกเท่านั้น
if (selectedFile && selectedFile !== originalAnimation) {
  formData.append("Ani_animation", selectedFile);
}

if (selectedImage && selectedImage !== originalImage) {
  formData.append("Ani_image", selectedImage);
}

// ตรวจสอบว่ามีข้อมูลที่ต้องอัปเดตหรือไม่
if (!formData.has("Ani_name") && 
    !formData.has("Ani_description") && 
    !formData.has("Ani_animation") && 
    !formData.has("Ani_image")) {
  Swal.fire({
    title: "คุณยังไม่ได้ทำการแก้ไขข้อมูล",
    icon: "info",
    confirmButtonText: "ตกลง",
  });
  return; // หยุดการทำงานหากไม่มีอะไรเปลี่ยน
}

      axios
        .put(`/api/animation/updateAnimation/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

      //  / แจ้งเตือนเมื่อเพิ่มโมเดลสำเร็จ
      Swal.fire({
        title: "อัปเดตอนิเมชันสำเร็จ!",
        text: "อนิเมชันของคุณอัปเดตเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      }).then((result) => {
        if (result.isConfirmed) {
          // เมื่อผู้ใช้กด "ตกลง" จะทำการนำทางไปยังหน้าถัดไป
          navigate('/Biomechanical-consideration');
        }
      });

    } catch (error) {
      console.error("ไม่สามารถอัปเดตอนิเมชันได้", error);
      setUploading(false);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตอนิเมชันได้", "error");
    }
  }


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
        };

  // ฟังก์ชันในการลบไฟล์
  const handleDeleteFile = (fileType) => {
    if (fileType === 'Ani_animation') {
      setExistingAnimation(null);
      setOriginalAnimation(null);
    } else if (fileType === 'Ani_image') {
      setExistingImage(null);
      setOriginalImage(null);
    }
  };
  console.log(selectedImage);

// ปรับขนาดเมื่อค่าจากฐานข้อมูลเปลี่ยน
useEffect(() => {
  if (nameRef.current) {
    nameRef.current.style.height = "auto";
    nameRef.current.style.height = `${nameRef.current.scrollHeight}px`;
  }
}, [newAnimationName]);

useEffect(() => {
  if (descriptionRef.current) {
    descriptionRef.current.style.height = "auto";
    descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
  }
}, [newAnimationDescription]);

  const handleInputChange = (e) => {
    handleAnimationNameChange(e);

    // ปรับขนาดเมื่อผู้ใช้พิมพ์
    const target = textAreaRef.current;
    target.style.height = "auto"; 
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleInputChangeDescription = (e) => {
    handleAnimationDescriptionChange(e);

    // ปรับขนาดเมื่อผู้ใช้พิมพ์
    const target = textAreaRef.current;
    target.style.height = "auto"; 
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="Content">
      <ToastContainer />
      
      <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <div className="Content" style={{ backgroundColor: "#fff", margin: '20px' }}>
        <h1 style={{ margin: '0', fontSize: '20px', marginBottom: '15px' }}>แก้ไขแอนิเมชัน</h1>
        {loading ? (
         <Button variant="" disabled    style={{
          display: 'flex', // ใช้ flex เพื่อให้เนื้อหาภายในจัดแนวในแนวนอน
          background: 'none',
          border: 'none',
          margin: 'auto',
          alignItems: 'center', // ทำให้สปินเนอร์และข้อความอยู่ตรงกลาง
        }}
      >
         <Spinner
           as="span"
           animation="grow"
          //  size="lg"
           role="status"
           aria-hidden="true"
           style={{marginRight:'5px',background:'rgb(168, 69, 243)', width: '25px',  // ปรับขนาดของสปินเนอร์
            height: '25px'}}
         />
         กำลังโหลด...
       </Button>
      ) : (
        <form>
        <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_name" className="lebel-bio">ชื่อแอนิเมชัน :</label>
          <br />
          <textarea
           ref={nameRef}
            // placeholder="ชื่อโมเดล"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              // height: '45px',
              resize: 'none',
              background: '#f5f5f5',
              overflow: 'hidden'
            }} wrap="soft"
            value={newAnimationName}
            onChange={handleInputChange}
            // onChange={(e) => {
            //   handleAnimationNameChange(e);
            //   e.target.style.height = 'auto';  // รีเซ็ตความสูงก่อน
            //   e.target.style.height = `${e.target.scrollHeight}px`;  // ปรับความสูงตามเนื้อหา
            // }}
            required
          />
          </div>
          {/* <br /> */}
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_description" className="lebel-bio">รายละเอียดแอนิเมชัน :</label>
          <br />
          <textarea
           ref={descriptionRef}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              // height: '45px',
              resize: 'none',
              background: '#f5f5f5',
              overflow: 'hidden'
            }}
            wrap="soft"
            value={newAnimationDescription}
            onChange={handleInputChangeDescription}
            // onChange={(e) => {
            //   handleAnimationDescriptionChange(e);
            //   e.target.style.height = 'auto';  // รีเซ็ตความสูงก่อน
            //   e.target.style.height = `${e.target.scrollHeight}px`;  // ปรับความสูงตามเนื้อหา
            // }}
            required
          />
</div>
          
<div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
          <label htmlFor="Ani_animation" className="lebel-bio">ไฟล์แอนิเมชัน : </label>
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
                    
                        {selectedFile && (
                          <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
                            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                              <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
                              <div>
                                <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{decodeURIComponent(selectedFile.name)}</div>
                                <div style={{ fontSize: '12px', color: '#444444' }}> {selectedFile.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB" : "ขนาดไฟล์ไม่ถูกต้อง"}</div>
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


            <form className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>

          {/* <br /> */}
          <label htmlFor="Ani_image" className="lebel-bio">ไฟล์รูปภาพหน้าปกแอนิเมชัน :</label>
          <br />
          <Input
            type="file"
            name="Ani_image"
            className="choose-file"
            id="Ani_image"
            accept="image/*"
            display='none'
            onChange={handleImageChange}
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
                    
                        {selectedImage && (
                          <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
                            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                              <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
                              <div>
                                <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{decodeURIComponent(selectedImage.name)}</div>
                                <div style={{ fontSize: '12px', color: '#444444' }}> {selectedImage.size ? (selectedImage.size / (1024 * 1024)).toFixed(2) + " MB" : "ขนาดไฟล์ไม่ถูกต้อง"}</div>
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

              </form>
            
          <button type="button" className="cancel-button" onClick={handleCancel}>
            ยกเลิก
          </button>
          <button type="button" className="add-button" onClick={handleUpdateAnimation}>
            บันทึก
          </button>


        </form>
)}
      </div>

    </div>
  );
}

export default Edit_Biomechanical_consideration;
