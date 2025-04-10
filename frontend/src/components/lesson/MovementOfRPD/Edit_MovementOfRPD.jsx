import React, { useEffect, useState } from "react";
import { ref, get, set } from "firebase/database"; 
import { database } from "../../../config/firebase"; 
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./MovementOfRPD.css";

function Edit_MovementOfRPD() {
  const location = useLocation();
  const [animationName, setAnimationName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [existingAnimation, setExistingAnimation] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // const validateName = (name) => {
  //   // ตัดช่องว่างหน้า-หลัง แล้วเช็คว่าชื่อว่างเปล่าหรือเป็นช่องว่างล้วนๆ
  //   if (!name.trim()) {
  //     setNameError("กรุณากรอกชื่อ ห้ามเป็นค่าว่างหรือเว้นวรรคเพียงอย่างเดียว");
  //     return false;
  //   }
  //   setNameError("");
  //   return true;
  // }


  useEffect(() => {
    const fetchAnimationData = async () => {
      if (!location.state || !location.state.id) {
        console.error("Animation id is not defined.");
        return;
      }
  
      // ใช้ id ในการดึงข้อมูล
      const animationRef = ref(database, `animations/${location.state.id}`);
      try {
        const snapshot = await get(animationRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setAnimationName(data.name);
          setVideoUrl(data.url);
          setImageUrl(data.imageUrl);
        } else {
          console.warn("Animation not found in database.");
        }
      } catch (error) {
        console.error("Error fetching animation:", error);
      }
    };
  
    fetchAnimationData();
  }, [location.state]);
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setSelectedFileName(file.name);
  };

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    setSelectedImage(image);
    setSelectedImageName(image.name);
  };

  const handleAnimationNameChange = (e) => {
    setAnimationName(e.target.value);
  };
  
  const handleUpdateAnimation = async () => {
    if (!animationName || !videoUrl || !imageUrl) {
      Swal.fire("Missing Data", "Please provide all fields.", "warning");
      return;
    }
  
    try {
      const animationRef = ref(database, `animations/${location.state.id}`); // ใช้ id ในการอัปเดตข้อมูล
      await set(animationRef, {
        id: location.state.id,
        name: animationName,
        url: videoUrl,
        imageUrl: imageUrl
      });
  
      // แจ้งเตือนเมื่ออัปเดตสำเร็จ
      Swal.fire({
        title: "Success",
        text: "Animation updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
        timer: 3000,  // ตัวจับเวลาการแสดงผล 3 วินาที
        showConfirmButton: false  // ไม่แสดงปุ่มยืนยัน
      });
  
      // Redirect หลังจากแสดงแจ้งเตือน
     
        navigate("/MovementOfRPD-teacher");
       // หยุดการเปลี่ยนหน้าเป็นเวลา 3 วินาที
  
    } catch (error) {
      console.error("Error updating animation:", error);
      Swal.fire("Error", "Failed to update animation.", "error");
    }
  };
  
  

  const handleCancel = () => {
    navigate(`/MovementOfRPD-teacher`);
  };

  return (
    <div className="Content">
      <h1 className="text-lg md:text-xl lg:text-3xl text-center font-bold mt-2.5">การเคลื่อนที่ของฟันเทียม</h1>
      <div className=" bg-white m-4  ">
        <div className="mb-6 p-4 border rounded-md bg-gray-100">
          <h1 className="mb-2 text-sm md:text-base lg:text-lg">Edit Animation</h1>
          <form>
            <div className=" lg:items-center">
              <label
                htmlFor="Ani3D_name"
                className=" mr-3 mb-2 text-sm md:text-base"
              >
                Animation Name:
              </label>

              <div className="w-full ">
                <input
                  type="text"
                  id="Ani3D_name"
                  value={animationName}
                  onChange={handleAnimationNameChange}
                  className="text-xs md:text-sm text-black w-full border border-gray-300 rounded-md p-2  lg:w-11/12"
                />
              </div>

              <br />
              <label htmlFor="Ani3D_Animation" className="text-sm md:text-base">Choose Animation File: </label>
              <br />

              {selectedFile && (
                <div className="flex items-center justify-center bg-gray-100">
                  <video
                    controls
                    className="w-96 lg:w-2/5"
                    src={URL.createObjectURL(selectedFile)}
                  />
                </div>
              )}
              {existingAnimation && !selectedFile && (
                <div className="flex items-center justify-center bg-gray-100">
                  <video
                    controls
                    className="w-96 lg:w-2/5"
                    src={existingAnimation}
                  />
                </div>
              )}
              <div className="text-center">
                <p className="mb-1 text-xs md:text-sm lg:text-base">ชื่อไฟล์ : {selectedFileName || existingAnimation}</p>
                <button
                  title="เพิ่มวิดีโอ"
                  className="bg-purple-600 text-xs md:text-sm text-white px-3 py-2 rounded mt-1.5 mr-2 hover:bg-purple-500"
                  onClick={() =>
                    document.getElementById("Ani3D_Animation").click()
                  }
                >
                  เลือกไฟล์
                </button>
              </div>

              <input
                type="file"
                name="Ani3D_Animation"
                className="hidden"
                id="Ani3D_Animation"
                accept="video/*"
                
                onChange={handleFileChange}
              />
              <br />
              <label htmlFor="Ani3D_image" className="text-sm md:text-base">Choose Image File: </label>
              <br />

              {selectedImage && (
                <div className="flex items-center justify-center bg-gray-100">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="w-96 lg:w-2/5 hover:transform-none"
                  />
                </div>
              )}
              {existingImage && !selectedImage && (
                <div className="flex items-center justify-center bg-gray-100">
                  <img
                    src={existingImage}
                    alt="Existing"
                    className="w-96 lg:w-2/5 hover:transform-none"
                  />
                </div>
              )}
              <div className="text-center">
                <p className="mt-4 mb-1 text-xs md:text-sm lg:text-base">ชื่อไฟล์ : {selectedImageName || existingImage}</p>
                <button
                  title="เพิ่มรูปภาพ"
                  className="bg-purple-600 text-xs md:text-sm text-white px-3 py-2 rounded mt-1.5 mr-2 hover:bg-purple-500"
                  onClick={() =>
                    document.getElementById("Ani3D_image").click()
                  }
                >
                  เลือกไฟล์
                </button>
              </div>
              <input
                type="file"
                name="Ani3D_image"
                id="Ani3D_image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <hr />
            <div className="flex items-center justify-center w-full text-xs md:text-sm mt-5">
              <button
                className=" bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
                onClick={handleCancel}
              >
                ยกเลิก
              </button>
              <button
                className=" bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                onClick={handleUpdateAnimation}
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Edit_MovementOfRPD;
