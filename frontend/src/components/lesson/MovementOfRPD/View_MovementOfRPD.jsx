import React, { useEffect, useState } from "react";
// import axios from "axios";
import './MovementOfRPD.css';
import { useParams } from "react-router-dom";
import { ref, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { HiPlusSm } from "react-icons/hi";

function View_MovementOfRPD() {

  const [animation3d, setAnimation3d] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage,setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.selectedFile) {
      setSelectedFile(location.state.selectedFile);
    }

    // ดึงคำค้นหาจาก URL query string
    const query = new URLSearchParams(location.search);
    const search = query.get('search') || '';
    setSearchTerm(search);

    const fetchAnimation3d = async () => {
      try {
        const animation3dRef = ref(storage, "animation3d/");
        const animation3dList = await listAll(animation3dRef);
        const animation3dData = await Promise.all(
          animation3dList.prefixes.map(async (folderRef) => {
            try {
              console.log(`Fetching animation3d.mp4 for folder: ${folderRef.name}`);
              const animation3dUrl = await getDownloadURL(ref(storage, `${folderRef.fullPath}/animation3d.mp4`));
              console.log(`Successfully fetched animation3d.mp4 for folder: ${folderRef.name}`);
              
              const aniImageUrl = await getDownloadURL(ref(storage, `${folderRef.fullPath}/image.jpg`));
              console.log(`Successfully fetched image.jpg for folder: ${folderRef.name}`);
            
              return { id: folderRef.name, name: folderRef.name, url: animation3dUrl, aniImageUrl };
            } catch (error) {
              console.warn(`Error fetching files for ${folderRef.name}:`, error.message);
              return null;
            }
                     
          })
        );
        setAnimation3d(animation3dData.filter((item) => item !== null));
      } catch (error) {
        console.error("Error fetching animation3d:", error);
      }
    };
    fetchAnimation3d(); // Fetch animations on component load
  }, [location.state, location.search]); 



  const goToEditPage = (name, url, aniImageUrl) => {
    navigate(`/Edit-MovementOfRPD/${name}/edit`,{state: {name, url, aniImageUrl}});
    
  };

  const removeAnimation = async (animation3dName) => {
    const confirmDelete = await Swal.fire({
      title: 'คุณต้องการลบแอนนิเมชันนี้หรือไม่?',
      // text: "คุณจะไม่สามารถย้อนกลับได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#9333ea',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    });
  
    if (confirmDelete.isConfirmed) {
      try {
        const folderRef = ref(storage, `animation3d/${animation3dName}`);
        const listResult = await listAll(folderRef);
        await Promise.all(listResult.items.map((itemRef) => deleteObject(itemRef)));
  
        console.log("ลบเสร็จสิ้น");
  
        const updatedAnimation3d = animation3d.filter((animation) => animation.name !== animation3dName);
        setAnimation3d(updatedAnimation3d);
        
        Swal.fire(
          'ลบแล้ว!',
          'แอนนิเมชันของคุณถูกลบเรียบร้อยแล้ว',
          'success'
        );
  
      } catch (error) {
        console.error("Error deleting animation:", error);
        Swal.fire(
          'ผิดพลาด!',
          'เกิดข้อผิดพลาดในการลบแอนนิเมชัน',
          'error'
        );
      }
    } else {
      console.log("ยกเลิกการลบ");
    }
  };


  const handleAddAnimation = () => {
    navigate(`/Add-MovementOfRPD`);
  };

  const handleImageClick = (name, url, aniImageUrl) => {
    // setSelectedImage({name, url});

    navigate(`/animation3d/${name}/view`,{
      state: {selectedFile: {name, url, aniImageUrl}},
    });
  };

  return (
    <div className="cont">
      <div className="flex justify-between my-2 mx-4 ">
      <h1 className="my-2 text-xl font-semibold">การเคลื่อนที่ของฟันเทียม</h1>
      <button 
        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleAddAnimation}>
        <HiPlusSm className="w-5 h-5 mr-2" />
        เพิ่มสื่อการสอน
      </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mx-4">
        {animation3d.map((animation) => (
          <div
            className="cursor-pointer bg-white shadow-sm rounded-lg p-4 object-cover"
            key={animation.name}
          >
            <img
              onClick={() =>
                handleImageClick(animation.name, animation.url, animation.aniImageUrl, animation.description)
              }
              src={animation.aniImageUrl}
              alt={animation.name}
              className="cursor-pointer mb-4 w-full rounded"
            />
            <h3 className="text-lg font-bold mb-2 text-center break-words">
              {animation.name}
            </h3>
            <div className="flex items-center justify-center w-full text-sm">
              <button
                className=" bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
                onClick={() => goToEditPage(animation.name, animation.url, animation.aniImageUrl, animation.description)}
              >
                แก้ไข
              </button>
              <button
                className=" bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                onClick={() => removeAnimation(animation.name)}
              >
                ลบ
              </button>
            </div>           
          </div>
        ))}
      </div>   

      {/* <div style={{ display: 'flex', marginBottom: "20px", marginTop: '20px', justifyContent: 'center' }}>
        <button className="button-add" onClick={handleAddAnimation}>
        
          <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
          </svg>
        </button>
      </div>  */}
     




    </div>
  );
}

export default View_MovementOfRPD;