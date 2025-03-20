import React, { useState, useEffect } from 'react';
import { set, push, ref as dbRef, get } from 'firebase/database';
import { uploadBytesResumable, ref as storageRef, getDownloadURL,listAll } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { database, storage } from '../../../config/firebase'; // Ensure this path is correct
import { HiUpload } from "react-icons/hi"
import { TbFile } from "react-icons/tb";

import { BsBadge3D } from "react-icons/bs";
import { Button, Input, } from '@chakra-ui/react';
import { CiFileOn } from "react-icons/ci";
// import { HiUpload } from 'react-icons/hi';
import { RxCross2 } from "react-icons/rx";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
// import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const getUniqueFileName = async (originalFileName, folder) => {
    const fileExtension = originalFileName.split('.').pop();
    const baseName = originalFileName.slice(0, originalFileName.lastIndexOf('.'));
    let newFileName = originalFileName;
    let counter = 1;

    const folderRef = storageRef(storage,  `${folder}/`);

    try {
      console.log("Folder Reference:", folderRef);

      // ดึงรายการไฟล์ในโฟลเดอร์
      const fileList = await listAll(folderRef);
      console.log("File List:", fileList); // ตรวจสอบโครงสร้างข้อมูล
      
      const existingFiles = fileList.items.map(item => item.name); 
      console.log("Existing Files:", existingFiles);

      // ตรวจสอบว่ามีไฟล์ชื่อเดียวกันอยู่แล้วหรือไม่
      while (existingFiles.includes(newFileName)) {
          newFileName = `${baseName}_${counter}.${fileExtension}`;
          console.log(`File exists, changing name to: ${newFileName}`);
          counter++;
      }
  } catch (error) {
      console.error("Error listing files:", error);
  }

  return newFileName;
};

const uploadFile = async (file, folder, contentType) => {
  try {
    // ตรวจสอบชื่อไฟล์ใหม่
    const newFileName = await getUniqueFileName(file.name, folder);  
    const fileRef = storageRef(storage, `${folder}/${newFileName}`);

    // กำหนด contentType ตามประเภทไฟล์
    let metadata = { contentType };
    if (!contentType) {
      switch (folder) {
        case 'models':
          contentType = file.name.endsWith('.gltf') ? 'model/gltf+json' : 'model/gltf-binary';
          break;
        case 'patterns':
          contentType = 'application/octet-stream';
          break;
        case 'images':
          contentType = file.type || 'image/jpeg';
          break;
        default:
          contentType = file.type || 'application/octet-stream';
      }
      metadata = { contentType }; // กำหนด metadata ใหม่หลังจากเช็ค contentType
    }

    console.log("fileRef:", fileRef);
    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          console.log("Transferred:", snapshot.bytesTransferred, "of", snapshot.totalBytes);
        },
        (error) => reject(error),
        async () => {
          // ได้ URL ที่มี token ต่อท้าย
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Upload complete:", downloadURL);  // แสดง URL ที่ถูกต้องพร้อมกับ token
          resolve(downloadURL);  // ส่งกลับ URL ที่ถูกต้อง
        }
      );
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

const handleSaveModel = async (event) => {
  event.preventDefault();
  
    // ตรวจสอบว่าไฟล์และชื่อโมเดลครบถ้วน
    if (!modelName || !fileImage || !filePattern || !fileModel) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      return;
    }
  
  
  // ตรวจสอบว่าโมเดลชื่อเดียวกันมีอยู่แล้ว
  const existingModel = models.find((model) => model.name === modelName);
  if (existingModel) {
    Swal.fire({
      title: "ชื่อโมเดลนี้ถูกใช้ไปแล้ว",
      icon: "warning",
      confirmButtonText: "ตกลง",
    });
    return;
  }

  setUploading(true);
  try {
    // กำหนดประเภทของไฟล์
    const modelContentType = 'model/gltf-binary';
    const patternContentType = 'application/octet-stream';
    const imageContentType = 'image/jpeg';
  
    // อัปโหลดไฟล์ทั้ง 3
    
    // อัปโหลดไฟล์โมเดล
    const modelToastId = toast.info("กำลังอัปโหลดไฟล์โมเดล...", {
      position: "top-right",
      autoClose: false, // ให้ค้างไว้จนกว่าการอัปโหลดจะเสร็จ
      theme: "light",
      transition: Flip,
    });
    const modelUrl = await uploadFile(fileModel, 'models', modelContentType);
  
    // อัปเดต Toast สำหรับไฟล์โมเดลเมื่อการอัปโหลดเสร็จสิ้น
    toast.update(modelToastId, {
      render: "อัปโหลดไฟล์โมเดลเสร็จสิ้น!",
      type: "success",
      autoClose: 1500, // ปิดหลังจาก 2 วินาที
    });
  
    // อัปโหลดไฟล์พัทเทิร์น
    const patternToastId = toast.info("กำลังอัปโหลดไฟล์พัทเทิร์น...", {
      position: "top-right",
      autoClose: false, // ให้ค้างไว้จนกว่าการอัปโหลดจะเสร็จ
      theme: "light",
      transition: Flip,
    });
    const patternUrl = await uploadFile(filePattern, 'patterns', patternContentType);
  
    // อัปเดต Toast สำหรับไฟล์พัทเทิร์นเมื่อการอัปโหลดเสร็จสิ้น
    toast.update(patternToastId, {
      render: "อัปโหลดไฟล์พัทเทิร์นเสร็จสิ้น!",
      type: "success",
      autoClose: 1500, // ปิดหลังจาก 2 วินาที
    });
  
    // อัปโหลดไฟล์รูปภาพ
    const imageToastId = toast.info("กำลังอัปโหลดไฟล์รูปภาพ...", {
      position: "top-right",
      autoClose: false, // ให้ค้างไว้จนกว่าการอัปโหลดจะเสร็จ
      theme: "light",
      transition: Flip,
    });
    const imageUrl = await uploadFile(fileImage, 'images', imageContentType);
  
    // อัปเดต Toast สำหรับไฟล์รูปภาพเมื่อการอัปโหลดเสร็จสิ้น
    toast.update(imageToastId, {
      render: "อัปโหลดไฟล์รูปภาพเสร็จสิ้น!",
      type: "success",
      autoClose: 1500, // ปิดหลังจาก 2 วินาที
    });
  

  

    // **สร้าง ID อัตโนมัติใน Firebase**
    const newModelRef = push(dbRef(database, 'models/'));
    const modelId = newModelRef.key; // ดึง ID ที่ Firebase สร้างให้

    // **บันทึกข้อมูลโมเดลพร้อม ID**
    const newModel = { id: modelId, name: modelName, url: modelUrl, patternUrl, imageUrl };
    await set(newModelRef, newModel);

    // อัปเดตสถานะของโมเดลใน state
    setModels([...models, newModel]);
    setUploading(false);
    setUploadProgress(0);

 // แจ้งเตือนเมื่อเพิ่มโมเดลสำเร็จ
 Swal.fire({
  title: "เพิ่มโมเดลสำเร็จ!",
  text: "โมเดลของคุณถูกเพิ่มเรียบร้อยแล้ว",
  icon: "success",
  confirmButtonText: "ตกลง",
}).then((result) => {
  if (result.isConfirmed) {
    // เมื่อผู้ใช้กด "ตกลง" จะทำการนำทางไปยังหน้าถัดไป
    navigate('/Possible-Movement-Of-RPD');
  }
});
  } catch (error) {
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
            navigate("/Possible-Movement-Of-RPD");
          }
        });
      };
  // };
  
      // ฟังก์ชันในการลบไฟล์
      const handleDeleteFile = (fileType) => {
        if (fileType === 'model') {
          setFileModel(null);
        } else if (fileType === 'pattern') {
          setFilePattern(null);
        } else if (fileType === 'image') {
          setFileImage(null);
        }
      };
      // const showToast = () => {
      //   toast.success('Hello World!');
      // };
    
  return (
    <div className="Content" style={{ backgroundColor: '#fff', color: "#000", margin: '0' }}>
      {/* boxShadow: 'rgba(163, 163, 163, 0.12) 0px 0px 5px 1px, rgba(204, 203, 203, 0.5) 0px 1px 10px 1px' , */}
      {/* <div className="" style={{background:'none',background: '#fff' }}>
<ToastContainer  />   
      </div> */}
     
      <div style={{ margin: '20px' }}>
      <ToastContainer  />   
      {/* <button onClick={showToast}>Show Toast</button> */}
        <h3 style={{ fontSize: '1.5rem', margin: '0', marginBottom: '', }}>เพิ่มสื่อการสอน RPD sample case</h3>

        <form encType="multipart/form-data" onSubmit={handleSaveModel} style={{ marginTop: '15px' }}>
          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
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
                height: '45px',
                resize: 'none',
                background: '#f5f5f5',
                overflow: 'hidden'

              }}
              wrap="soft"
              value={modelName}
              onChange={(e) => {
                setModelName(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              // required
            />
          </div>
          {/* <br /> */}

        <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
  <label htmlFor="" className="lebel-bio">ไฟล์โมเดล :  <span style={{ color: 'red' }}>*</span></label>
  <div>
    <Input
      type="file"
      id="model-file"
      onChange={(e) => handleFileChange(e, setFileModel)} 
      accept=".obj,.gltf,.glb,.stl" // กำหนดชนิดไฟล์ที่รองรับ
      display="none" // ซ่อน input
      name="model-file" 
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
      onClick={() => document.querySelector('#model-file').click()} // คลิก input เมื่อคลิกปุ่ม
    >
      <HiUpload /> อัปโหลดไฟล์
    </Button>

    {fileModel && (
      <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
          <div>
            <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{fileModel.name}</div>
            {/* <div style={{ fontSize: '12px', color: '#444444' }}>{fileModel.size}</div> */}
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
          onClick={() => handleDeleteFile('model')}
        >
          <RxCross2 color='#52525b'/>
        </Button>
      </div>
    )}
  </div>
</div>
         

<div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
  <label htmlFor="" className="lebel-bio">ไฟล์ Pattern :  <span style={{ color: 'red' }}>*</span></label>
  <div>
    <Input
      type="file"
      id="pattern-file"
      name="pattern-file" 
      onChange={(e) => handleFileChange(e, setFilePattern)}  
      accept=".patt" // กำหนดชนิดไฟล์ที่รองรับ
      display="none" // ซ่อน input
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
      onClick={() => document.querySelector('#pattern-file').click()} // คลิก input เมื่อคลิกปุ่ม
    >
      <HiUpload /> อัปโหลดไฟล์
    </Button>

    {filePattern && (
      <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
          <div>
            <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{filePattern.name}</div>
            {/* <div style={{ fontSize: '12px', color: '#444444' }}>{filePattern.size}</div> */}
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
          onClick={() => handleDeleteFile('pattern')}
        >
          <RxCross2 color='#52525b'/>
        </Button>
      </div>
    )}
  </div>
</div>

<div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
  <label htmlFor="" className="lebel-bio">ไฟล์รูปภาพ :  <span style={{ color: 'red' }}>*</span></label>
  <div>
    <Input
      type="file"
      id="image-file"
      onChange={(e) => handleFileChange(e, setFileImage)}  
      accept=".jpg,.jpeg,.png,.svg" // กำหนดชนิดไฟล์ที่รองรับ
      display="none" // ซ่อน input
      name="image-file" 
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
      onClick={() => document.querySelector('#image-file').click()} // คลิก input เมื่อคลิกปุ่ม
    >
      <HiUpload /> อัปโหลดไฟล์
    </Button>

    {fileImage && (
      <div style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '5px', background: 'rgb(237, 237, 237)', width: '100%', display: 'flex', alignItems: 'center', boxShadow: 'rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em' }}>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <TbFile size={22} style={{ marginRight: '10px', color: '#52525b' }} />
          <div>
          <div style={{ display:'flex',flexDirection:'column',textOverflow:'ellipsis',fontWeight: '450',overflow:'hidden',whiteSpace:'nowrap',fontSize:'14px' }}>{fileImage.name}</div>
            {/* <div style={{ fontSize: '12px', color: '#444444' }}>{fileImage.size}</div> */}
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
          onClick={() => handleDeleteFile('image')}
        >
          <RxCross2 color='#52525b'/>
        </Button>
      </div>
    )}
  </div>
</div>
          <div className="" style={{ marginBottom: '40px' }}>
            <button type="button" className="cancel-button" onClick={handleCancel}>ยกเลิก</button>
            <button type="submit" className="add-button">บันทึก</button>
          </div>
        </form>

        {/* {uploading && (
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

export default Add_RPD;
