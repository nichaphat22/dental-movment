import React, { useState, useEffect } from 'react';
import { set, push, ref as dbRef, get } from 'firebase/database';
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

    const existingModel = models.find((model) => model.name === modelName);
    if (existingModel) {
      console.error("มีชื่อโมเดลนี้แล้ว");
      return;
    }

    setUploading(true);

    try {
      const modelContentType = 'model/gltf-binary';
      const patternContentType = 'application/octet-stream';
      const imageContentType = 'image/jpeg';

      const modelUrl = await uploadFile(fileModel, 'models', modelContentType);
      const patternUrl = await uploadFile(filePattern, 'patterns', patternContentType);
      const imageUrl = await uploadFile(fileImage, 'images', imageContentType);

      // **สร้าง ID อัตโนมัติใน Firebase**
      const newModelRef = push(dbRef(database, 'models/'));
      const modelId = newModelRef.key; // ดึง ID ที่ Firebase สร้างให้

      // **บันทึกข้อมูลโมเดลพร้อม ID**
      const newModel = { id: modelId, name: modelName, url: modelUrl, patternUrl, imageUrl };
      await set(newModelRef, newModel);

      setModels([...models, newModel]);
      setUploading(false);
      setUploadProgress(0);
      alert("เพิ่มโมเดลสำเร็จ!");
      navigate('/Possible-Movement-Of-RPD'); 
    } catch (error) {
      console.error("ไม่สามารถบันทึกโมเดลได้", error);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="Content" style={{ backgroundColor: '#fff', color: "#000" }}>
      <div style={{ margin: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>เพิ่มโมเดล</h3>
        <form encType="multipart/form-data" onSubmit={handleSaveModel} style={{ marginTop: '15px' }}>
          <label htmlFor="modelName" className="lebel-bio">
            ชื่อโมเดล: <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #d0d0d0',
              borderRadius: '5px',
              height: '80px',
              resize: 'none',
              overflow: 'hidden',
            }}
            wrap="soft"
            value={modelName}
            onChange={(e) => {
              setModelName(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            required
          />
          <br />
          <label htmlFor="fileModel" className="lebel-bio">ไฟล์โมเดล: <span style={{ color: 'red' }}>*</span></label><br />
          <input type="file" name="fileModel" id="fileModel" className='choose-file' onChange={(e) => handleFileChange(e, setFileModel)} required />

          <br />
          <label htmlFor="filePattern" className="lebel-bio">ไฟล์ Pattern: <span style={{ color: 'red' }}>*</span></label><br />
          <input type="file" name="filePattern" id="filePattern" className='choose-file' onChange={(e) => handleFileChange(e, setFilePattern)} required />

          <br />
          <label htmlFor="fileImage" className="lebel-bio">ไฟล์รูปภาพโมเดล: <span style={{ color: 'red' }}>*</span></label><br />
          <input type="file" name="fileImage" id="fileImage" className='choose-file' onChange={(e) => handleFileChange(e, setFileImage)} required /><br />

          <button type="button" className="cancel-button" onClick={handleCancel}>ยกเลิก</button>
          <button type="submit" className="add-button">บันทึก</button>
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
