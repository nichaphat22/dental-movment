import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { useParams } from "react-router-dom";
import { baseUrl } from '../../../utils/services';
import { useNavigate } from "react-router-dom";

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


  useEffect(() => {
    if (id) {
      axios.get(`${baseUrl}/animation/getAnimationById/${id}`)
        .then(response => {
          const { Ani_name, Ani_description, Ani_animation, Ani_image } = response.data;
          setNewAnimationName(Ani_name);
          setNewAnimationDescription(Ani_description);
          setExistingAnimation(Ani_animation ? `data:${Ani_animation.contentType};base64,${Ani_animation.data}` : null);
          setExistingImage(Ani_image ? `data:${Ani_image.contentType};base64,${Ani_image.data}` : null);

          // เก็บข้อมูลเดิม
          setOriginalAnimationName(Ani_name);
          setOriginalAnimationDescription(Ani_description);
          setOriginalAnimation(Ani_animation ? `data:${Ani_animation.contentType};base64,${Ani_animation.data}` : null);
          setOriginalImage(Ani_image ? `data:${Ani_image.contentType};base64,${Ani_image.data}` : null);
        })
        .catch(error => {
          console.error('Error:', error);
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
  
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file); // ไม่ต้องแปลงเป็น base64
  };
  
  const handleUpdateAnimation = () => {
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

    if (!isDataChanged) {
      alert("You haven't made any changes to the data.");
      return;
    }
  
    if (!newAnimationName || !newAnimationDescription) {
      alert("Please provide both animation name and description.");
      return;
    }
  
    const formData = new FormData();
    formData.append("Ani_name", newAnimationName);
    formData.append("Ani_description", newAnimationDescription);
  
    if (selectedFile) {
      formData.append("Ani_animation", selectedFile); // ส่งไฟล์โดยตรง
    }
  
    if (selectedImage) {
      formData.append("Ani_image", selectedImage); // ส่งไฟล์โดยตรง
    }
  
    setUploading(true);
  
    axios
      .put(`http://localhost:8080/api/animation/updateAnimation/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      })
      .then((response) => {
        console.log(response.data);
        setUploading(false);
        setUploadProgress(0);
        alert("แก้ไขแอนิเมชันสำเร็จ!");
        navigate('/Biomechanical-consideration'); // เปลี่ยนเส้นทางไปที่หน้าที่แสดงข้อมูล
      })
      .catch((error) => {
        console.error("Error:", error);
        setUploading(false);
        setUploadProgress(0);
        alert("ไม่สามารถแก้ไขแอนิเมชันได้");
      });
      
  };
    // ฟังก์ชันเพื่อกลับไปหน้าก่อนหน้า
    const handleCancel = () => {
      navigate('/Biomechanical-consideration');  // ย้อนกลับไปยังหน้าที่แล้วในประวัติการเรียกดู
    };
  
  return (
    <div className="Content">
      <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <div className="Content" style={{ backgroundColor: "#fff", margin: '20px' }}>
        <h1 style={{ margin: '0',fontSize: '20px',marginBottom:'15px'  }}>แก้ไขแอนิเมชัน</h1>
        
        <form>
          <label  htmlFor="Ani_name" className="lebel-bio">ชื่อแอนิเมชัน :</label>
          <br />
          {/* <input
            type="text"
            id="Ani_name"
            value={newAnimationName}
            onChange={handleAnimationNameChange}
          /> */}
                        <textarea
                        // placeholder="ชื่อโมเดล"
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '20px',
                          border: '1px solid #d0d0d0',
                          borderRadius: '5px',
                          height: '80px',
                          resize: 'none',
                          overflow: 'hidden'  // ซ่อน scrollbar
                        }}                        wrap="soft"
                        value={newAnimationName}
                        onChange={(e) => {
                          handleAnimationNameChange(e);
                          e.target.style.height = 'auto';  // รีเซ็ตความสูงก่อน
                          e.target.style.height = `${e.target.scrollHeight}px`;  // ปรับความสูงตามเนื้อหา
                        }}
                        required
                    />
          <br />
          {/* <br /> */}
          <label htmlFor="Ani_description" className="lebel-bio">รายละเอียดแอนิเมชัน :</label>
          <br />
          {/* <input
            type="text"
            id="Ani_description"
            value={newAnimationDescription}
            onChange={handleAnimationDescriptionChange}
          /> */}
 <textarea
  style={{
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid #d0d0d0',
    borderRadius: '5px',
    height: '80px',
    resize: 'none',
    overflow: 'hidden'  // ซ่อน scrollbar
  }}
  wrap="soft"
  value={newAnimationDescription}
  onChange={(e) => {
    handleAnimationDescriptionChange(e);
    e.target.style.height = 'auto';  // รีเซ็ตความสูงก่อน
    e.target.style.height = `${e.target.scrollHeight}px`;  // ปรับความสูงตามเนื้อหา
  }}
  required
/>

          <br />
          {/* <br /> */}
          <label htmlFor="Ani_Animation" className="lebel-bio">ไฟล์แอนิเมชัน : <span style={{color:'red',fontWeight:'400',fontSize:'0.85rem'}}>ขนาดไฟล์ไม่เกิน 16MB.</span></label>
          <br />
          
          <input
            type="file"
            name="Ani_Animation"
            className="choose-file"
            id="Ani_Animation"
            accept="video/*"
            onChange={handleFileChange}
          />
           {selectedFile && (
            <div>
              <video controls style={{width:'35%'}} src={URL.createObjectURL(selectedFile)} />
            </div>
          )}
          {existingAnimation && !selectedFile && (
            <div>
              <video controls style={{width:'35%'}} src={existingAnimation} />
            </div>
          )}
          {/* <br /> */}
          <label htmlFor="Ani_image" className="lebel-bio">ไฟล์รูปภาพหน้าปกแอนิเมชัน :</label>
          <br />
          <input
            type="file"
            name="Ani_image"
            className="choose-file"
            id="Ani_image"
            accept="image/*"
            onChange={handleImageChange}
          />
           {selectedImage && (
            <div>
              <img src={URL.createObjectURL(selectedImage)} alt="Selected" width="35%" />
            </div>
          )}
          {existingImage && !selectedImage && (
            <div>
              <img src={existingImage} alt="Existing" width="35%" />
            </div>
          )}
          {/* <small>Note: The image file size should not exceed 5MB.</small> */}
          {/* <input
            type="button"
            value="Save"
            className="save-button"
            onClick={handleUpdateAnimation}
          /> */}
             <button type="button" className="cancel-button" onClick={handleCancel}>
            ยกเลิก
          </button>
          <button type="button" className="add-button" onClick={handleUpdateAnimation}>
  บันทึก
</button>

          
        </form>
        {/* <div style={{ marginTop: '20px' }}> */}
         
         
        </div>
        {uploading && (
  <div style={{marginLeft:'20px'}}>
    <div className={`upload-status ${uploadProgress < 100 ? "uploading" : "completed"}`}>
      Status: {uploadProgress < 100 ? "Uploading" : "Completed"}
    </div>
    <div>Progress: {uploadProgress < 100 ? `${uploadProgress.toFixed(2)}%` : "100%"}</div>
    <progress value={uploadProgress} max="100"></progress>
  </div>
)}


      {/* </div> */}
    </div>
  );
}

export default Edit_Biomechanical_consideration;
