import React, { useEffect, useState } from "react"; 
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { storage } from '../../../config/firebase';
import { useLocation, useNavigate } from "react-router-dom";
import './MovementOfRPD.css';
import Swal from "sweetalert2";

function Edit_MovementOfRPD() {
  const location = useLocation();
  const [newAnimationName, setNewAnimationName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingAnimation, setExistingAnimation] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [originalAnimationName, setOriginalAnimationName] = useState("");
  const [originalAnimation, setOriginalAnimation] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimationData = async () => {
      if (!location.state || !location.state.name) {
        console.error("Animation name is not defined.");
        return;
      }

      const animationName = location.state.name;
      setNewAnimationName(animationName);

      const animationRef = ref(storage, `animation3d/${animationName}/animation3d.mp4`);
      const imageRef = ref(storage, `animation3d/${animationName}/image.jpg`);

      try {
        const [animationUrl, imageUrl] = await Promise.all([
          getDownloadURL(animationRef),
          getDownloadURL(imageRef)
        ]);

        setExistingAnimation(animationUrl);
        setExistingImage(imageUrl);
        setOriginalAnimation(animationUrl);
        setOriginalImage(imageUrl);
        setOriginalAnimationName(animationName);
      } catch (error) {
        console.warn("Some files might not exist yet:", error);
      }
    };

    fetchAnimationData();
  }, [location.state]);

  const handleAnimationNameChange = (event) => {
    setNewAnimationName(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleUpdateAnimation = async () => {
    const isDataChanged =
      newAnimationName !== originalAnimationName ||
      selectedFile ||
      selectedImage;

    if (!isDataChanged) {
      Swal.fire("No Changes", "คุณไม่ได้เปลี่ยนแปลงข้อมูล", "info");
      navigate()
      return;
    }

    if (!newAnimationName) {
      Swal.fire("Missing Data", "Please provide an animation name.", "warning");
      return;
    }

    setUploading(true);

    try {
      if (originalAnimation) {
        const oldAnimationRef = ref(storage, `animation3d/${originalAnimationName}/animation3d.mp4`);
        await deleteObject(oldAnimationRef);
      }
      if (originalImage) {
        const oldImageRef = ref(storage, `animation3d/${originalAnimationName}/image.jpg`);
        await deleteObject(oldImageRef);
      }

      const formData = [];
      const newAnimationRef = ref(storage, `animation3d/${newAnimationName}/animation3d.mp4`);
      const newImageRef = ref(storage, `animation3d/${newAnimationName}/image.jpg`);

      if (selectedFile) {
        const uploadTaskVideo = uploadBytesResumable(newAnimationRef, selectedFile);
        formData.push(uploadTaskVideo);
      }

      if (selectedImage) {
        const uploadTaskImage = uploadBytesResumable(newImageRef, selectedImage);
        formData.push(uploadTaskImage);
      }

      await Promise.all(formData);

      Swal.fire("สำเร็จ", "อัปเดตแอนิเมชันสำเร็จแล้ว!", "success");
      navigate('/MovementOfRPD');
    } catch (error) {
      console.error("Error updating animation:", error);
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการอัปเดตแอนิเมชัน", "error");
    } finally {
      setUploading(false);
    }
  };

  // ฟังก์ชันเพื่อกลับไปหน้าก่อนหน้า
  const handleCancel = () => {
    navigate('/MovementOfRPD');  // ย้อนกลับไปยังหน้าที่แล้วในประวัติการเรียกดู
  };

  return (
    <div className="Content">
      <h1 className="title-h1">การเคลื่อนที่ของฟันเทียม</h1>
      <div className="Content" style={{ backgroundColor: "#fff", marginLeft: '20px' }}>
        <h1>Edit Animation</h1>
        <form>
          <label htmlFor="Ani3D_name">Animation Name:</label>
          <br />
          <input
            type="text"
            id="Ani3D_name"
            value={newAnimationName}
            onChange={handleAnimationNameChange}
          />
          <br />
          <label htmlFor="Ani3D_Animation">Choose Animation File:</label>
          <br />
          <input
            type="file"
            name="Ani3D_Animation"
            className="choose-file"
            id="Ani3D_Animation"
            accept="video/*"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <div>
              <video controls style={{ width: '300px' }} src={URL.createObjectURL(selectedFile)} />
            </div>
          )}
          {existingAnimation && !selectedFile && (
            <div>
              <video controls style={{ width: '300px' }} src={existingAnimation} />
            </div>
          )}
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
          {selectedImage && (
            <div>
              <img src={URL.createObjectURL(selectedImage)} alt="Selected" width="300" />
            </div>
          )}
          {existingImage && !selectedImage && (
            <div>
              <img src={existingImage} alt="Existing" width="300" />
            </div>
          )}
          <br />
          {/* <input
            type="button"
            value="Save"
            className="save-button"
            onClick={handleUpdateAnimation}
          />
          <br />
          <input
            type="button"
            value="Save"
            className="save-button"
            onClick={handleCancel}
          /> */}
          <div className="flex items-center justify-center w-full text-sm">
              <button
                className=" bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
                onClick={handleCancel}
              >
                ยกเลิก
              </button>
              <button
                className=" bg-green-500 text-white px-3 py-2 rounded  hover:bg-green-600"
                onClick={handleUpdateAnimation}
              >
                บันทึก
              </button>
              
            </div>   
        </form>
        {uploading && (
          <div>
            <p>Uploading: {uploadProgress.toFixed(2)}%</p>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )}
      </div>
    </div>
  );
}

export default Edit_MovementOfRPD;
