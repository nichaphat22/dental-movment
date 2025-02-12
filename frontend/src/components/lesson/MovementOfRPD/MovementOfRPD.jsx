import React, { useState, useEffect } from "react";
import axios from "axios";
import './MovementOfRPD.css';
import { ref, listAll, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../config/firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function MovementOfRPD() {
  const [newAnimationName, setNewAnimationName] = useState("");
  const [newAnimationDescription, setNewAnimationDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [animation3d, setAnimation3d] = useState([]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimation3D = async () => {
      try {
        const animation3dRef = ref(storage, 'animation3d/');
        const animation3dList = await listAll(animation3dRef);

        const animation3dData = await Promise.all(animation3dList.prefixes.map(async (folderRef) => {
          const animation3dUrl = await getDownloadURL(ref(storage, `${folderRef.fullPath}/animation3d.mp4`));
          const aniImageUrl = await getDownloadURL(ref(storage, `${folderRef.fullPath}/image.jpg`)).catch(() => null);

          return { id: folderRef.name, name: folderRef.name, url: animation3dUrl, aniImageUrl: aniImageUrl };
        }));
  
        setAnimation3d(animation3dData);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchAnimation3D();
  }, []);

  const handleAnimation3DNameChange = (event) => {
    setNewAnimationName(event.target.value);
  };

  const handleAnimation3DDescriptionChange = (event) => {
    setNewAnimationDescription(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };
    
  const handleAddAnimation3D = async () => {
    if (!newAnimationName || !selectedFile || !selectedImage) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please choose both animation and image files.',
      });
      return;
    }

    const existingModel = animation3d.find((animation) => animation.name === newAnimationName);
    if (existingModel) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Model',
        text: 'A model with this name already exists.',
      });
      return;
    }

    setUploading(true);
    // setErrorMessage("");

    try {
      const storageRefAnimation3d = ref(storage, `animation3d/${newAnimationName}/animation3d.mp4`);
      const uploadTaskAnimation3d = uploadBytesResumable(storageRefAnimation3d, selectedFile, { contentType: 'video/mp4' });

      const storageRefAniImage = ref(storage, `animation3d/${newAnimationName}/image.jpg`);
      const uploadTaskAniImage = uploadBytesResumable(storageRefAniImage, selectedImage, { contentType: 'image/jpeg' });

      const handleProgress = (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      };

      uploadTaskAnimation3d.on('state_changed', handleProgress, (error) => {
        console.error("Error saving animation3d:", error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Error',
          text: 'Failed to upload animation file.',
        });
        setUploading(false);
      });

      uploadTaskAniImage.on('state_changed', handleProgress, (error) => {
        console.error("Error saving image:", error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Error',
          text: 'Failed to upload image file.',
        });
        setUploading(false);
      });

      await Promise.all([uploadTaskAnimation3d, uploadTaskAniImage]);

      const urlAnimation3d = await getDownloadURL(uploadTaskAnimation3d.snapshot.ref);
      const urlAniImage = await getDownloadURL(uploadTaskAniImage.snapshot.ref);
      const newAnimation3d = { id: newAnimationName, name: newAnimationName, url: urlAnimation3d, imageUrl: urlAniImage };

      setAnimation3d([...animation3d, newAnimation3d]);
      setNewAnimationName("");
      setNewAnimationDescription("");
      setSelectedFile(null);
      setSelectedImage(null);
      setUploading(false);
      setUploadProgress(0);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Animation3D and image saved successfully!', 
      }).then(() => {
        navigate('/MovementOfRPD')

      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add animation3D.',
        
      });
      setUploading(false);
    } 
  };

  return (
    <div className="Content">
      <h1 className="title-h1">การเคลื่อนที่ของฟันเทียม</h1>
      <div className="Content" style={{marginLeft:'20px'}}>
        <h1>Add New Animation</h1>
        <form>
          <label htmlFor="newAnimationName">Animation Name:</label>
          <br />
          <input
            type="text"
            id="newAnimationName"
            value={newAnimationName}
            onChange={handleAnimation3DNameChange}
          />
          {/* <br />
          <label htmlFor="newAnimationDescription">Animation Description:</label>
          <br />
          <input
            type="text"
            id="newAnimationDescription"
            value={newAnimationDescription}
            onChange={handleAnimation3DDescriptionChange}
          /> */}
          <br />
          <label htmlFor="Ani3D_animation">Choose Animation File:</label>
          <br />
          <input
            type="file"
            name="Ani3D_animation"
            className="choose-file"
            id="Ani3D_animation"
            accept="video/*"
            onChange={handleFileChange}
          />
          <br />
          <label htmlFor="Ani3D_image">Choose Image File:</label>
          <br />
          <input
            type="file"
            name="Ani3D_image"
            className="choose-file"
            id="Ani3D_image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <br />
          <input
            type="button"
            value="Add Animation"
            className="add-button"
            onClick={handleAddAnimation3D}
          />
        </form>
        {uploading && (
          <div>
            <p>Uploading: {uploadProgress.toFixed(2)}%</p>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )}
        {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default MovementOfRPD;
