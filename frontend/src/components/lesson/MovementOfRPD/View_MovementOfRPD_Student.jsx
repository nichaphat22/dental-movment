import React, { useEffect, useState } from "react";
// import axios from "axios";
import './MovementOfRPD.css';
import { ref, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";


function View_MovementOfRPD_Student() {
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

  const handleImageClick = (name, url, aniImageUrl) => {
    // setSelectedImage({name, url});

    navigate(`/animation3d/${name}/view`,{
      state: {selectedFile: {name, url, aniImageUrl}},
    });
  };

  return (
    <div className="cont">
    <h1 className="mx-4 my-2  text-base md:text-lg lg:text-2xl font-semibold">การเคลื่อนที่ของฟันเทียม</h1>
    <div className="grid grid-cols-1 hover:shadow-lg translate-x-4 lg:grid-cols-3 gap-6 justify-center md:mx-10 lg:mx-4">
      {animation3d.map((animation) => (
        <div
          className="cursor-pointer bg-white shadow-sm rounded-lg p-4 lg:transform lg:transition lg:duration-300 lg:hover:scale-105 lg:hover:shadow-md"
          key={animation.name}
          onClick={() =>
            handleImageClick(animation.name, animation.url, animation.aniImageUrl, animation.description)
          }
        >
          <img
            src={animation.aniImageUrl}
            alt={animation.name}
            className="cursor-pointer mb-4 w-full rounded hover:transform-none shadow-none"
          />
          <h3 className="md:text-base lg:text-lg font-bold mb-2 text-center break-words">
            {animation.name}
          </h3>
          
        </div>
      ))}
    </div>   
  </div>
  );
}

export default View_MovementOfRPD_Student;