import React, { useState, useEffect } from 'react';
import { ref as dbRef, set } from 'firebase/database';
import { uploadBytesResumable, ref as storageRef, getDownloadURL, deleteObject } from 'firebase/storage';
import { useNavigate, useLocation } from 'react-router-dom';
import { database, storage } from '../../../config/firebase';
// import {
//   FileUploadDropzone,
//   FileUploadList,
//   FileUploadRoot,
// } from "@/components/ui/file-upload";
// import { Progress } from "@/components/ui/progress";

const Edit_RPD = () => {
  const [name, setName] = useState("");
  const [fileModel, setFileModel] = useState(null);
  const [filePattern, setFilePattern] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const [existingModel, setExistingModel] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    const fetchModel = async () => {
      const model = location.state;
      if (model) {
        setExistingModel(model);
        setName(model.name);
      } else {
        navigate('/');
      }
    };

    fetchModel();
  }, [location.state, navigate]);

  const handleFileChange = (event, setter, setFileName) => {
    const file = event.target.files[0];
    setter(file);
    setFileName(file ? file.name : ""); // เก็บชื่อไฟล์ใหม่
  };


  const uploadFile = async (file, folder, newFileName) => {
    const fileRef = storageRef(storage, `${folder}/${newFileName || file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

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

  const deleteOldFile = async (oldFilePath) => {
    const fileRef = storageRef(storage, oldFilePath);
    try {
      await deleteObject(fileRef);
      console.log("Old file deleted successfully");
    } catch (error) {
      console.error("Error deleting old file:", error);
    }
  };

  const handleSaveModel = async (event) => {
    event.preventDefault();
    setUploading(true);

    try {
      if (fileModel && existingModel.url) {
        await deleteOldFile(existingModel.url);
      }
      if (filePattern && existingModel.patternUrl) {
        await deleteOldFile(existingModel.patternUrl);
      }
      if (fileImage && existingModel.imageUrl) {
        await deleteOldFile(existingModel.imageUrl);
      }

      const modelUrl = fileModel ? await uploadFile(fileModel, 'models', `${name}-model-${Date.now()}`) : existingModel.url;
      const patternUrl = filePattern ? await uploadFile(filePattern, 'patterns', `${name}-pattern-${Date.now()}`) : existingModel.patternUrl;
      const imageUrl = fileImage ? await uploadFile(fileImage, 'images', `${name}-image-${Date.now()}`) : existingModel.imageUrl;

      // แทนที่การใช้ name ด้วย id เพื่อไม่ให้เกิดการสร้าง entry ใหม่
      const updatedModel = { id: existingModel.id, name, url: modelUrl, patternUrl, imageUrl };
      const modelsRef = dbRef(database, 'models/' + existingModel.id);
      await set(modelsRef, updatedModel);

      setUploading(false);
      setUploadProgress(0);
      alert("แก้ไขโมเดลสำเร็จ!");
      navigate('/');
    } catch (error) {
      console.error("ไม่สามารถอัปเดตโมเดลได้", error);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Function to decode and return only the filename from the URL
  const getFileNameFromUrl = (url) => {
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.split('/').pop().split('?')[0]; // Extracts the filename
    }
    return '';
  };

  return (
    <div className="Content" style={{ backgroundColor: '#fff', color: "#000" }}>
      <div style={{ margin: '20px' }}>
        <h3 style={{ margin: '0', fontSize: '1.5rem', marginBottom: '15px' }}>แก้ไขโมเดล</h3>
        {/* <i><span>หมายเหตุ : </span><span>สร้างไฟล์ Pattern และดาวน์โหลดรูปภาพ Marker ได้ที่</span><a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html"> สร้างไฟล์ Pattern</a></i> */}
        <form encType="multipart/form-data" onSubmit={handleSaveModel} style={{ marginTop: '15px' }}>
          <div className="modelName-display" style={{ borderRadius: '5px', padding: '10px 20px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px' }}>
            <input type="hidden" value={existingModel?.modelName || ''} />

            <label htmlFor="name" className="lebel-bio">ชื่อโมเดล :</label>
            <textarea
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                border: 'none',
                // border: '1px solid #d0d0d0',
                borderRadius: '5px',
                height: '80px',
                resize: 'none',
                overflow: 'hidden',
                background: '#f5f5f5'
              }}
              wrap="soft"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              required
            />
          </div>
          <br />
          <div className="fileModel-display" style={{ borderRadius: '5px', padding: '10px 20px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px' }}>
            <label htmlFor="fileModel" className="lebel-bio">ไฟล์โมเดล :</label><br />
            <input type="file" name="fileModel" id="fileModel" onChange={(e) => handleFileChange(e, setFileModel)} />
            {existingModel && existingModel.url && (
              <div>
                <a href={existingModel.url} target="_blank" rel="noopener noreferrer">  <span> {getFileNameFromUrl(existingModel.url)}</span> </a>
              </div>
            )}
          </div>
          <br />

          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '10px 20px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px' }}>
            <label htmlFor="filePattern" className="lebel-bio">ไฟล์ Pattern : <span style={{ color: 'red' }}>* </span><span style={{ color: 'red', fontWeight: '400', fontSize: '0.85rem' }}><i>นามสกุลไฟล์ .patt</i></span></label><br />
            <input type="file" name="filePattern" id="filePattern" onChange={(e) => handleFileChange(e, setFilePattern)} />
            {existingModel && existingModel.patternUrl && (
              <div>
                <a href={existingModel.patternUrl} target="_blank" rel="noopener noreferrer"><span> {getFileNameFromUrl(existingModel.patternUrl)}</span> </a>
                {/* Displaying the file name */}
              </div>
            )}
          </div>
          <br />
          <div className="flieimg-display" style={{ borderRadius: '5px', padding: '10px 20px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px' }}>
            <label htmlFor="fileImage" className="lebel-bio">ไฟล์รูปภาพโมเดล :</label><br />
            <input type="file" name="fileImage" id="fileImage" onChange={(e) => handleFileChange(e, setFileImage)} />
            {existingModel && existingModel.imageUrl && (
              <div>

                <img src={existingModel.imageUrl} alt="Model Preview" style={{ maxWidth: '200px', maxHeight: '200px', boxShadow: 'none', transform: 'none' }} /> <br />
                {/* Displaying the file name */}<span> {getFileNameFromUrl(existingModel.imageUrl)}</span>
              </div>
            )}
          </div>
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
};

export default Edit_RPD;
