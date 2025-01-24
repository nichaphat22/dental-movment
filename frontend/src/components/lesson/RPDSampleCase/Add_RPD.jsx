import React, { useState, useEffect } from 'react';
import { set, ref as dbRef, get } from 'firebase/database';
import { uploadBytesResumable, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { database, storage } from '../../../config/firebase'; // Ensure this path is correct

function Add_RPD() {
  const [modelName, setModelName] = useState("");
  const [fileModel, setFileModel] = useState(null);
  const [filePattern, setFilePattern] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const [models, setModels] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsRef = dbRef(database, 'models/');
        const snapshot = await get(modelsRef);

        if (snapshot.exists()) {
          setModels(Object.values(snapshot.val()));
        } else {
          setModels([]);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  const handleFileChange = (event, setter) => {
    setter(event.target.files[0]);
  };

  const uploadFile = async (file, folder, contentType) => {
    const fileRef = storageRef(storage, `${folder}/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file, { contentType });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSaveModel = async (event) => {
    event.preventDefault();

    // if (!modelName || !fileModel || !filePattern || !fileImage) {
    //   console.error("Model name, model file, pattern file, and image file are required.");
    //   return;
    // }

    const existingModel = models.find((model) => model.name === modelName);
    if (existingModel) {
      console.error("มีชื่อโมเดลนี้แล้ว");
      return;
    }

    setUploading(true);

    try {
      // Define content types based on file extensions or types
      const modelContentType = 'model/gltf-binary'; // Adjust as needed
      const patternContentType = 'application/octet-stream'; // Adjust as needed
      const imageContentType = 'image/jpeg'; // Adjust as needed

      // Upload files and get their download URLs
      const modelUrl = await uploadFile(fileModel, 'models', modelContentType);
      const patternUrl = await uploadFile(filePattern, 'patterns', patternContentType);
      const imageUrl = await uploadFile(fileImage, 'images', imageContentType);

      // Save model data in Realtime Database
      const newModel = { name: modelName, url: modelUrl, patternUrl: patternUrl, imageUrl: imageUrl };
      const modelsRef = dbRef(database, 'models/' + modelName);
      await set(modelsRef, newModel);

      setModels([...models, newModel]);
      setUploading(false);
      setUploadProgress(0);
      alert("เพิ่มโมเดลสำเร็จ!");
      navigate('/'); // Change route to the page showing data
    } catch (error) {
      console.error("ไม่สามารถบันทึกโมเดลได้", error);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/'); // ย้อนกลับไปยังหน้าที่แล้วในประวัติการเรียกดู
  };

  return (
    <div className="Content" style={{ backgroundColor: '#fff', color: "#000" }}>
      {/* <h1 className="title-h1">Possible movement of RPD</h1>
      <div className='title'>การวางตำแหน่งของ REST และ RETAINER เพื่อป้องกัน การเคลื่อนที่ของ RPD</div> */}
     <div className="" style={{margin:'20px'}}>
      <h3 style={{ margin: '0', fontSize: '1.5rem',marginBottom:'15px' }}>เพิ่มโมเดล</h3>
      {/* <i><span style={{color:'',}}>หมายเหตุ : </span><span style={{fontWeight:'400',}}> สร้างไฟล์ Pattern และดาวน์โหลดรูปภาพ Marker ได้ที่</span><a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html"> สร้างไฟล์ Pattern</a></i> */}
     
      <form encType="multipart/form-data" onSubmit={handleSaveModel} style={{marginTop:'15px'}}>
        <label htmlFor="modelName" className="lebel-bio">ชื่อโมเดล : <span style={{ color: 'red' }}>* </span></label>
        {/* <input type="text" id="modelName" value={modelName} onChange={(e) => setModelName(e.target.value)} required /> */}
        <textarea
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            border: '1px solid #d0d0d0',
            borderRadius: '5px',
            height: '80px',
            resize: 'none',
            overflow: 'hidden',  // ซ่อน scrollbar
          }}
          wrap="soft"
          value={modelName}  // ใช้ state modelName เหมือนเดิม
          onChange={(e) => {
            setModelName(e.target.value);  // แก้ไข state modelName
            e.target.style.height = 'auto';  // รีเซ็ตความสูงก่อน
            e.target.style.height = `${e.target.scrollHeight}px`;  // ปรับความสูงตามเนื้อหา
          }}
          required
        />
        <br />
        <label htmlFor="fileModel" className="lebel-bio">ไฟล์โมเดล : <span style={{ color: 'red' }}>* </span></label><br />
        <input type="file" name="fileModel" id="fileModel" className='choose-file' onChange={(e) => handleFileChange(e, setFileModel)} required />

        <br />
        <label htmlFor="filePattern" className="lebel-bio">ไฟล์ Pattern : <span style={{ color: 'red' }}>* </span><span  style={{ color: 'red',fontWeight:'400',fontSize:'0.85rem' }}><i>นามสกุลไฟล์ .patt</i></span></label><br />
        <input type="file" name="filePattern" id="filePattern"  className='choose-file' onChange={(e) => handleFileChange(e, setFilePattern)} required />

        <br />
        <label htmlFor="fileImage" className="lebel-bio">ไฟล์รูปภาพโมเดล : <span style={{ color: 'red' }}>* </span></label><br />
        <input type="file" name="fileImage" id="fileImage"  className='choose-file' onChange={(e) => handleFileChange(e, setFileImage)} required /><br />

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

export default Add_RPD;
