import React, { useState, useEffect } from 'react';
import { set, push, ref as dbRef, get } from 'firebase/database';
import { uploadBytesResumable, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { database, storage } from '../../../config/firebase'; // Ensure this path is correct
import { Button } from "@chakra-ui/react"
import {
  FileUploadList,
  FileUploadRoot,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import { HiUpload } from "react-icons/hi"



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
  // const handleFileChange = (event, setter) => {
  //   const files = Array.from(event.target.files);
  //   setter(files);
  // };


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
    <div className="Content" style={{ backgroundColor: '#fff', color: "#000", margin: '0' }}>
      {/* boxShadow: 'rgba(163, 163, 163, 0.12) 0px 0px 5px 1px, rgba(204, 203, 203, 0.5) 0px 1px 10px 1px' , */}
      {/* <div className="" style={{background:'none',background: '#fff' }}>

      </div> */}
      <div style={{ margin: '20px' }}>
        <h3 style={{ fontSize: '1.5rem', margin: '0', marginBottom: '', }}>เพิ่มสื่อการสอน RPD sample case</h3>

        <form encType="multipart/form-data" onSubmit={handleSaveModel} style={{ marginTop: '15px' }}>
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="modelName" className="lebel-bio">
              ชื่อโมเดล: <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              style={{
                // margin:'10px 20px 10px 20px',
                width: '100%',
                padding: '10px',
                // marginBottom: '20px',
                // border: '1px solid #d0d0d0',
                border: '1px solid rgb(255, 255, 255)',
                borderRadius: '5px',
                height: '45px',
                resize: 'none',
                overflow: 'hidden',
                background: '#f5f5f5',
                boxSizing: 'border-box'

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
          </div>
          {/* <br /> */}


          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="" className="lebel-bio">ไฟล์โมเดล: <span style={{ color: 'red' }}>*</span></label>
            <FileUploadRoot maxFiles={1} onChange={(e) => handleFileChange(e, setFileModel)} required>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" style={{ fontSize: '14px', borderRadius: '5px', padding: '10px', background: 'rgb(145, 54, 205)', color: '#fff', boxShadow: 'rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset' }}>   <HiUpload /> อัปโหลดไฟล์
                </Button>
              </FileUploadTrigger>
              <FileUploadList showSize clearable />
            </FileUploadRoot>

          </div>
          {/* <br /> */}
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="" className="lebel-bio">ไฟล์ Pattern: <span style={{ color: 'red' }}>*</span></label>
            <FileUploadRoot maxFiles={1} onChange={(e) => handleFileChange(e, setFilePattern)} required >
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" style={{ fontSize: '14px', borderRadius: '5px', padding: '10px', background: 'rgb(145, 54, 205)', color: '#fff', boxShadow: 'rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset', }}>
                  <HiUpload /> อัปโหลดไฟล์
                </Button>
              </FileUploadTrigger>
              <FileUploadList showSize clearable />
            </FileUploadRoot>

          </div>
          {/* <br /> */}
          {/* boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px'  */}
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="" className="lebel-bio">ไฟล์รูปภาพโมเดล: <span style={{ color: 'red' }}>*</span></label>
            <FileUploadRoot maxFiles={1} onChange={(e) => handleFileChange(e, setFileImage)} required>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" style={{ fontSize: '14px', borderRadius: '5px', padding: '10px', background: 'rgb(145, 54, 205)', color: '#fff', boxShadow: 'rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset' }}>   <HiUpload /> อัปโหลดไฟล์
                </Button>
              </FileUploadTrigger>
              <FileUploadList showSize clearable />
            </FileUploadRoot>
          </div>
          <div className="" style={{ marginBottom: '40px' }}>
            <button type="button" className="cancel-button" onClick={handleCancel}>ยกเลิก</button>
            <button type="submit" className="add-button">บันทึก</button>
          </div>
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
