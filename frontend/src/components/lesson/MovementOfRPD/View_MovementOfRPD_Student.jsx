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
            const animation3dUrl = await getDownloadURL(ref(storage, `${folderRef.fullPath}/animation3d.mp4`));
            const aniImageUrl = await getDownloadURL(ref(storage, `${folderRef.fullPath}/image.jpg`));
            return { id: folderRef.name, name: folderRef.name, description: folderRef.description ,url: animation3dUrl, aniImageUrl: aniImageUrl };
          })
        );

        setAnimation3d(animation3dData);

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
    <h1 className="mx-4 my-2 text-xl font-semibold">การเคลื่อนที่ของฟันเทียม</h1>
    <div className="grid grid-cols-1 hover:shadow-lg translate-x-4 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mx-4">
      {animation3d.map((animation) => (
        <div
          className="cursor-pointer bg-white shadow-sm rounded-lg p-4 object-cover"
          key={animation.name}
          onClick={() =>
            handleImageClick(animation.name, animation.url, animation.aniImageUrl, animation.description)
          }
        >
          <img
            src={animation.aniImageUrl}
            alt={animation.name}
            className="cursor-pointer mb-4 w-full rounded"
          />
          <h3 className="text-lg font-bold mb-2 text-center break-words">
            {animation.name}
          </h3>
          
        </div>
      ))}
    </div>   
  </div>
  );
}

export default View_MovementOfRPD_Student;