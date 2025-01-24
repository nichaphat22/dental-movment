import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Biomechanical_consideration.css";
import { baseUrl } from '../../../utils/services';

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

    setUploading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/animation/saveAnimation`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      alert("เพิ่มแอนิเมชันสำเร็จ!");
      navigate('/Biomechanical-consideration');
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเพิ่มแอนิเมชันได้");
    } finally {
      setUploading(false);
    }
  };

  // ฟังก์ชันเพื่อกลับไปหน้าก่อนหน้า
  const handleCancel = () => {
    navigate('/Biomechanical-consideration'); // ย้อนกลับไปยังหน้าที่แล้วในประวัติการเรียกดู
  };

  return (
    <div className="Content">
      <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <div className="Content" style={{ margin: '20px' }}>
        <h1 style={{ margin: '0', fontSize: '1.5rem',marginBottom:'15px' }}>เพิ่มแอนิเมชัน</h1>

        <form onSubmit={handleAddAnimation}>
          <label htmlFor="Ani_name" className="lebel-bio">ชื่อแอนิเมชัน : <span style={{color:'red'}}>*</span></label>
          <br />
          <textarea
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              height: '80px',
              resize: 'none',
              overflow: 'hidden'
            }}
            wrap="soft"
            value={Ani_name}
            onChange={(e) => {
              handleAnimationNameChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            required
          />
          <br />

          <label htmlFor="Ani_description" className="lebel-bio">รายละเอียดแอนิเมชัน : <span style={{color:'red'}}>*</span></label>
          <br />
          <textarea
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              height: '80px',
              resize: 'none',
              overflow: 'hidden'
            }}
            wrap="soft"
            value={Ani_description}
            onChange={(e) => {
              handleAnimationDescriptionChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            required
          />
          <br />

          <label htmlFor="Ani_Animation" className="lebel-bio">ไฟล์แอนิเมชัน : <span style={{color:'red'}}>* </span><span style={{color:'red',fontWeight:'400',fontSize:'0.85rem'}}><i>ขนาดไฟล์ไม่เกิน 16MB.</i></span></label>
          <br />
          <input
            type="file"
            name="Ani_Animation"
            className="choose-file"
            id="Ani_Animation"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
          <br />
          
          <label htmlFor="Ani_image" className="lebel-bio">ไฟล์รูปภาพหน้าปกแอนิเมชัน : <span style={{color:'red'}}>*</span></label>
          <br />
          <input
            type="file"
            name="Ani_image"
            className="choose-file"
            id="Ani_image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          <br />
          <button type="button" className="cancel-button" onClick={handleCancel}>
            ยกเลิก
          </button>
          <button type="submit" className="add-button">
            บันทึก
          </button>
          
        </form>

        {uploading && (
          <div style={{ marginLeft: '20px' }}>
            <div className={`upload-status ${uploadProgress < 100 ? "uploading" : "completed"}`}>
              Status: {uploadProgress < 100 ? "Uploading" : "Completed"}
            </div>
            <div>Progress: {uploadProgress < 100 ? `${uploadProgress.toFixed(2)}%` : "100%"}</div>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )}
      </div>
    </div>
  );
}

export default BiomechanicalConsideration;
