import React, { useState, useEffect } from 'react';
import { get, ref, update } from 'firebase/database';
import { uploadBytesResumable, ref as storageRef, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { database, storage } from '../../../config/firebase';
// import { Button } from "@chakra-ui/react"
// import {
//   FileUploadList,
//   FileUploadRoot,
//   FileUploadTrigger,
// } from "@/components/ui/file-upload"
import { HiUpload } from "react-icons/hi"
import { TbFile } from "react-icons/tb";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
// import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BsBadge3D } from "react-icons/bs";
import { Button, Input, } from '@chakra-ui/react';
import { CiFileOn } from "react-icons/ci";
// import { HiUpload } from 'react-icons/hi';
import { RxCross2 } from "react-icons/rx";
const Edit_RPD = () => {
  const [name, setName] = useState("");
  const [models, setModels] = useState([]);
  const [fileModel, setFileModel] = useState(null);
  const [filePattern, setFilePattern] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const [existingModel, setExistingModel] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState(existingModel || ''); // เริ่มต้นด้วย URL ที่มีอยู่แล้ว
  const [fileList, setFileList] = useState([]);

  // const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // ดึง id จาก URL
  const navigate = useNavigate();

  console.log(fileModel)
  useEffect(() => {
    console.log("Current Path:", window.location.pathname);
    console.log("Params ID:", id);

    if (!id) {
      console.warn("No ID found, redirecting...");
      navigate('/');
      return;
    }


    const fetchModelData = async () => {
      try {
        // ดึงข้อมูลจาก Firebase Realtime Database
        const modelsRef = ref(database, "models/");
        const snapshot = await get(modelsRef);

        if (snapshot.exists()) {
          const modelsData = snapshot.val();
          console.log("Fetched Models Data:", modelsData); // ตรวจสอบข้อมูลทั้งหมด
          const model = modelsData[id];  // เข้าถึงข้อมูลโมเดลโดยใช้ id
          console.log("Fetched Model:", model); // ตรวจสอบข้อมูลของ model

          // หากมีข้อมูลจาก model ให้ตั้งค่าผลลัพธ์ใน state
          setExistingModel(model); // ตั้งค่า state existingModel แทน
          if (model?.name) {
            setName(model.name); // ตั้งชื่อโมเดลที่ดึงมาจาก Firebase
          }
          if (model?.url) {
            setFileModel([{ url: model.url }]);
          }
          if (model?.patternUrl) {
            setFilePattern([{ url: model.patternUrl }]);
          }
          if (model?.imageUrl) {
            setFileImage([{ url: model.imageUrl }]);
          }
        } else {
          console.log("No data available for this model ID");
        }
      } catch (error) {
        console.error("Error fetching model data:", error);
      }
    };

    fetchModelData();  // เรียกใช้ฟังก์ชันดึงข้อมูล
  }, [id]);  // ติดตามการเปลี่ยนแปลงของ id

  // ตรวจสอบเมื่อ existingModel มีการเปลี่ยนแปลง
  // ฟังก์ชันในการดึงชื่อไฟล์จาก URL
  //  const getFileNameFromUrl = (url) => {
  //   return url.substring(url.lastIndexOf('/') + 1);
  // };


  // ใช้ useEffect เพื่อกำหนดค่าเริ่มต้นของ fileModel จาก existingModel
  // const getFileSizeFromUrl = async (url) => {
  //   try {
  //     const response = await fetch(url, { method: 'HEAD', mode: 'cors' }); // ใช้ 'HEAD' request เพื่อดึง header เท่านั้น
  //     const contentLength = response.headers.get('Content-Length'); // ดึงขนาดไฟล์จาก header
  //     if (contentLength) {
  //       return (contentLength / 1024 / 1024).toFixed(1) + ' MB'; // แปลงเป็น MB
  //     }
  //     return 'N/A'; // ถ้าไม่มีข้อมูลขนาด
  //   } catch (error) {
  //     console.error('Error fetching file size:', error);
  //     return 'N/A'; // ถ้าเกิดข้อผิดพลาด
  //   }
  // };

  useEffect(() => {
    if (existingModel) {
      // ดึงขนาดไฟล์ของโมเดลจาก URL
      // getFileSizeFromUrl(existingModel.url).then((modelSize) => {
      setFileModel({
        name: getFileNameFromUrl(existingModel.url),
        url: existingModel.url,
        // size: modelSize, // ใช้ขนาดของไฟล์โมเดล
      });
      // });

      // ดึงขนาดไฟล์ของ pattern จาก URL
      // getFileSizeFromUrl(existingModel.patternUrl).then((patternSize) => {
      setFilePattern({
        name: getFileNameFromUrl(existingModel.patternUrl),
        url: existingModel.patternUrl,
        // size: patternSize, // ใช้ขนาดของไฟล์ pattern
      });
      // });

      // ดึงขนาดไฟล์ของรูปภาพจาก URL
      // getFileSizeFromUrl(existingModel.imageUrl).then((imageSize) => {
      setFileImage({
        name: getFileNameFromUrl(existingModel.imageUrl),
        url: existingModel.imageUrl,
        // size: imageSize, // ใช้ขนาดของไฟล์รูปภาพ
      });
      // });
    }
  }, [existingModel]);



  // ฟังก์ชันในการจัดการการอัปโหลดไฟล์ใหม่
  const handleFileChange = (event, fileType) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newFile = files[0];

      const fileData = {
        name: newFile.name,
        file: newFile, // ⭐ เก็บไฟล์จริง
        url: URL.createObjectURL(newFile), // ใช้แค่ preview
        size: (newFile.size / 1024 / 1024).toFixed(1) + " MB",
      };

      if (fileType === 'model') {
        setFileModel(fileData);
      } else if (fileType === 'pattern') {
        setFilePattern(fileData);
      } else if (fileType === 'image') {
        setFileImage(fileData);
      }
    }
  };


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

  // ฟังก์ชันในการลบไฟล์
  const deleteOldFile = async (oldFilePath) => {
    const fileRef = storageRef(storage, oldFilePath);
    try {
      await deleteObject(fileRef);
      console.log("Old file deleted successfully");
    } catch (error) {
      console.error("Error deleting old file:", error);
    }
  };



  // import { ref as storageRef, listAll } from "firebase/storage";

  const getUniqueFileName = async (originalFileName, folder) => {
    const fileExtension = originalFileName.split('.').pop();
    const baseName = originalFileName.slice(0, originalFileName.lastIndexOf('.'));
    let newFileName = originalFileName;
    let counter = 1;

    const folderRef = storageRef(storage, `${folder}/`);

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


  const uploadFile = async (file, folder) => {
    try {
      console.log("Uploading file:", file.name);

      // ตรวจสอบชื่อไฟล์ใหม่
      const newFileName = await getUniqueFileName(file.name, folder);
      const fileRef = storageRef(storage, `${folder}/${newFileName}`);

      let contentType;
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

      const metadata = { contentType };
      console.log(" fileRef:", fileRef);
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



  // ฟังก์ชันการบันทึกข้อมูล (ซึ่งรวมถึงการลบไฟล์เก่าและอัปโหลดไฟล์ใหม่)
  const handleSaveModel = async (event) => {
    event.preventDefault();
    setUploading(true);

    try {
      // ค้นหาข้อมูลโมเดลที่มีอยู่แล้วตามชื่อ
      const existingModel2 = models.find((model) => model.name === name);

      // กำหนดค่าตัวแปรของ URL ต่างๆ
      let modelUrl = existingModel.url;
      let patternUrl = existingModel.patternUrl;
      let imageUrl = existingModel.imageUrl;

      // ตัวแปรเพื่อเช็คว่ามีการเปลี่ยนแปลงหรือไม่
      let isChanged = false;

      // กำหนดค่า modelName จากการแก้ไขในฟอร์ม หรือค่าที่คุณต้องการใช้
      //  const modelName = existingModel2; // หรืออาจจะเป็นชื่อที่ผู้ใช้กรอกในฟอร์ม
      console.log('existingModel2', existingModel2)
      // หากโมเดลมีชื่อเดียวกันแล้วจะแจ้งเตือน
      if (existingModel2) {
        Swal.fire({
          title: "ชื่อโมเดลนี้ถูกใช้ไปแล้ว",
          icon: "warning",
          confirmButtonText: "ตกลง",
        });
        return;
      }



      // ตรวจสอบการเปลี่ยนแปลงชื่อโมเดล
      if (existingModel.name !== name) {
        isChanged = true; // ถ้าชื่อเปลี่ยนแปลง
      }

      // ลบไฟล์เก่าแล้วอัปโหลดไฟล์ใหม่
      // if (fileModel && fileModel.file) {

      //   await deleteOldFile(existingModel.url); // ลบไฟล์เก่า
      //   toast.info("กำลังกำลังกำลังอัปโหลดไฟล์โมเดล...", {
      //     position: "top-right",
      //     autoClose: 2000,
      //     theme: "light",
      //     transition: Flip,
      //   });
      //   modelUrl = await uploadFile(fileModel.file, 'models'); // อัปโหลดไฟล์ใหม่
      //   // toast.update(modelToastId, {
      //   //   render: "อัปโหลดไฟล์โมเดลเสร็จสิ้น!",
      //   //   type: "success",
      //   //   autoClose: 1500,
      //   // });
      //   if (fileModel.file !== existingModel.url) {
      //     isChanged = true; // มีการเปลี่ยนแปลงไฟล์
      //   }

      // }

      if (fileModel && fileModel.file) {
        await deleteOldFile(existingModel.url); // ลบไฟล์เก่า
        toast.info("กำลังกำลังกำลังอัปโหลดไฟล์โมเดล...", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          transition: Flip,
        });
        modelUrl = await uploadFile(fileModel.file, 'models'); // อัปโหลดไฟล์ใหม่
        // toast.update(modelToastId, {
        //   render: "อัปโหลดไฟล์โมเดลเสร็จสิ้น!",
        //   type: "success",
        //   autoClose: 1500,
        // });
          isChanged = true; // มีการเปลี่ยนแปลงไฟล์
        
      }

      if (filePattern && filePattern.file) {
    
        // ลบไฟล์เก่าทุกครั้งก่อนการอัปโหลดไฟล์ใหม่
        await deleteOldFile(existingModel.patternUrl);
    
        toast.info("กำลังกำลังกำลังอัปโหลดไฟล์พัทเทิร์น...", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          transition: Flip,
        });
    
        // อัปโหลดไฟล์ใหม่
        patternUrl = await uploadFile(filePattern.file, 'patterns');
    
        // อัปเดตสถานะว่ามีการเปลี่ยนแปลงไฟล์
        isChanged = true;
    }

      // if (filePattern && filePattern.file) {
      //   await deleteOldFile(existingModel.patternUrl); // ลบไฟล์ pattern เก่า
      //   toast.info("กำลังกำลังกำลังอัปโหลดไฟล์พัทเทิร์น...", {
      //     position: "top-right",
      //     autoClose: 2000,
      //     theme: "light",
      //     transition: Flip,
      //   });
      //   patternUrl = await uploadFile(filePattern.file, 'patterns');
      //   // toast.update(patternToastId, {
      //   //   render: "อัปโหลดไฟล์พัทเทิร์นเสร็จสิ้น!",
      //   //   type: "success",
      //   //   autoClose: 1500,
      //   // });
      //   if (filePattern.file !== existingModel.patternUrl) {
      //     isChanged = true; // มีการเปลี่ยนแปลงไฟล์
      //   }

      // }

      if (fileImage && fileImage.file) { 
        // const fileName = fileImage.file.name; // ชื่อไฟล์ใหม่
        // let oldFileName = decodeURIComponent(existingModel.imageUrl.split('/').pop().split('?')[0]); // ตัด query string ออก
    
        // // ลบ "images/" ถ้ามี
        // if (oldFileName.startsWith("images/")) {
        //     oldFileName = oldFileName.replace("images/", "");
        // }
    
        // console.log("ชื่อไฟล์ใหม่:", fileName);
        // console.log("ชื่อไฟล์เก่า:", oldFileName);
    
        // ลบไฟล์เก่าทุกครั้งก่อนการอัปโหลดไฟล์ใหม่
        await deleteOldFile(existingModel.imageUrl);
    
        toast.info("กำลังกำลังกำลังอัปโหลดไฟล์รูปภาพ...", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            transition: Flip,
        });
    
        // อัปโหลดไฟล์ใหม่
        imageUrl = await uploadFile(fileImage.file, 'images');
    
        // อัปเดตสถานะว่ามีการเปลี่ยนแปลงไฟล์
        isChanged = true;
    }
    
    

      // หากไม่มีการเปลี่ยนแปลงข้อมูลใดๆ
      if (!isChanged) {
        Swal.fire({
          title: "คุณยังไม่ได้ทำการแก้ไขข้อมูล",
          icon: "info",
          confirmButtonText: "ตกลง",
        });
        return; // หยุดการทำงานหากไม่มีการเปลี่ยนแปลง
      }

      // อัปเดตข้อมูลใน Firebase
      const updatedModel = {
        id: existingModel.id,
        name,
        url: modelUrl,
        patternUrl,
        imageUrl
      };

      const modelsRef = ref(database, 'models/' + existingModel.id);
      await update(modelsRef, updatedModel);
      setModels([...models, updatedModel]);
      //  / แจ้งเตือนเมื่อเพิ่มโมเดลสำเร็จ
      Swal.fire({
        title: "อัปเดตโมเดลสำเร็จ!",
        text: "โมเดลของคุณอัปเดตเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      }).then((result) => {
        if (result.isConfirmed) {
          // เมื่อผู้ใช้กด "ตกลง" จะทำการนำทางไปยังหน้าถัดไป
          navigate('/Possible-Movement-Of-RPD');
        }
      });

    } catch (error) {
      console.error("ไม่สามารถอัปเดตโมเดลได้", error);
      setUploading(false);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตโมเดลได้", "error");
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
  // Function to decode and return only the filename from the URL
  const getFileNameFromUrl = (url) => {
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.split('/').pop().split('?')[0]; // Extracts the filename
    }
    return '';
  };
  // console.log(getFileNameFromUrl(existingModel.url))/
  return (
    <div className="Content" style={{ backgroundColor: '#fff', color: "#000" }}>
      <div style={{ margin: '20px' }}>
        <ToastContainer />
        <h3 style={{ margin: '0', fontSize: '1.5rem', marginBottom: '15px' }}>แก้ไขโมเดล</h3>
        {/* <i><span>หมายเหตุ : </span><span>สร้างไฟล์ Pattern และดาวน์โหลดรูปภาพ Marker ได้ที่</span><a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html"> สร้างไฟล์ Pattern</a></i> */}
        {/* onSubmit={handleSaveModel} */}
        <form encType="multipart/form-data" onSubmit={handleSaveModel} style={{ marginTop: '15px' }}>
          <div className="modelName-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', marginBottom: '20px' }}>
            <input type="hidden" value={existingModel?.name || ''} />

            <label htmlFor="name" className="lebel-bio">ชื่อโมเดล :</label>
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
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
          </div>

          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="" className="lebel-bio">ไฟล์โมเดล : </label>
            <div>
              <Input
                type="file"
                id="model-file"
                onChange={(e) => handleFileChange(e, 'model')}
                accept=".obj,.gltf,.glb" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: '5px',
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
                      <div style={{ display: 'flex', flexDirection: 'column', textOverflow: 'ellipsis', fontWeight: '450', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '14px' }}>{fileModel.name}</div>
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
                    <RxCross2 color='#52525b' />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="" className="lebel-bio">ไฟล์ Pattern : </label>
            <div>
              <Input
                type="file"
                id="pattern-file"
                onChange={(e) => handleFileChange(e, 'pattern')}
                accept=".patt" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: '5px',
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
                      <div style={{ display: 'flex', flexDirection: 'column', textOverflow: 'ellipsis', fontWeight: '450', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '14px' }}>{filePattern.name}</div>
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
                    <RxCross2 color='#52525b' />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="filepattern-display" style={{ borderRadius: '5px', padding: '20px 30px', boxShadow: 'rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px', background: '#fff', marginBottom: '20px' }}>
            <label htmlFor="" className="lebel-bio">ไฟล์รูปภาพ : </label>
            <div>
              <Input
                type="file"
                id="image-file"
                onChange={(e) => handleFileChange(e, 'image')}
                accept=".jpg,.jpeg,.png,.svg" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: '5px',
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
                      <div style={{ display: 'flex', flexDirection: 'column', textOverflow: 'ellipsis', fontWeight: '450', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '14px' }}>{fileImage.name}</div>
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
                    <RxCross2 color='#52525b' />
                  </Button>
                </div>
              )}
            </div>
          </div>


          <br />
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
};

export default Edit_RPD;
