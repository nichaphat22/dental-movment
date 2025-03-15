import React, { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set, onValue, push } from "firebase/database";
import { storage } from "../../../config/firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiImage, FiVideo } from "react-icons/fi";

function MovementOfRPD() {
  const [newAnimationName, setNewAnimationName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [animation3d, setAnimation3d] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const animationRef = dbRef(db, "animations/");

    onValue(animationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const animationsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAnimation3d(animationsArray);
      }
    });
  }, []);

  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);
  const handleImageChange = (event) => setSelectedImage(event.target.files[0]);

  const handleAddAnimation3D = async () => {
    if (!newAnimationName || !selectedFile || !selectedImage) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "กรุณาเลือกไฟล์วิดีโอและรูปภาพ" });
      return;
    }

    if (animation3d.some((animation) => animation.name === newAnimationName)) {
      Swal.fire({ icon: "error", title: "Duplicate Name", text: "มีโมเดลชื่อนี้อยู่แล้ว" });
      return;
    }

    setUploading(true);
    const storageRefAnim = ref(storage, `animation3d/${newAnimationName}/animation3d.mp4`);
    const storageRefImg = ref(storage, `animation3d/${newAnimationName}/image.jpg`);
    const db = getDatabase();
    const newAnimationRef = push(dbRef(db, "animations/"));

    try {
      const uploadAnim = uploadBytesResumable(storageRefAnim, selectedFile);
      const uploadImg = uploadBytesResumable(storageRefImg, selectedImage);

      uploadAnim.on("state_changed", (snapshot) => {
        setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      });

      uploadImg.on("state_changed", (snapshot) => {
        setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      });

      await Promise.all([uploadAnim, uploadImg]);

      const urlAnim = await getDownloadURL(uploadAnim.snapshot.ref);
      const urlImg = await getDownloadURL(uploadImg.snapshot.ref);

      await set(newAnimationRef, {
        id: newAnimationRef.key,
        name: newAnimationName,
        url: urlAnim,
        imageUrl: urlImg,
      });

      setUploading(false);
      setNewAnimationName("");
      setSelectedFile(null);
      setSelectedImage(null);
      setUploadProgress(0);

      Swal.fire({ icon: "success", title: "Success", text: "อัปโหลดสำเร็จ!" }).then(() => {
        navigate("/MovementOfRPD");
      });
    } catch (error) {
      console.error("Upload Error:", error);
      Swal.fire({ icon: "error", title: "Error", text: "เกิดข้อผิดพลาดในการอัปโหลด" });
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="ml-4 text-xl md:text-2xl">การเคลื่อนที่ของฟันเทียม</h1>
      <div className="flex justify-center">
        <div className="border mt-3 rounded-md bg-gray-100 p-6 max-w-6xl w-full mx-auto">
          <h1 className="text-base md:text-lg">เพิ่ม Animation ใหม่</h1>
          <form>
            <label htmlFor="newAnimationName" className="mt-2 mb-1.5">ชื่อ Animation:</label>
            <br />
            <input type="text" id="newAnimationName" value={newAnimationName} onChange={(e) => setNewAnimationName(e.target.value)} className="w-11/12 p-2 border rounded-md" />

            <div className="relative text-center flex justify-center mb-2 mt-4">
              {selectedFile ? (
                <video controls src={URL.createObjectURL(selectedFile)} className="w-full max-w-md aspect-video rounded-lg shadow-md" />
              ) : (
                <div className="w-full max-w-md h-48 flex items-center justify-center border border-dashed text-gray-500 rounded-lg">
                  <FiVideo className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <input type="file" name="Ani3D_animation" id="Ani3D_animation" accept="video/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="Ani3D_animation" className="md:w-40 lg:w-72 block bg-purple-600 text-white text-sm lg:text-base text-center py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-600">
                เลือกไฟล์วิดีโอ
              </label>
            </div>

            <div className="relative text-center flex justify-center mt-14">
              {selectedImage ? (
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="max-w-md h-52 object-contain rounded-lg shadow-md" />
              ) : (
                <div className="w-full max-w-md h-48 flex items-center justify-center border border-dashed text-gray-500 rounded-lg">
                  <FiImage className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <input type="file" name="Ani3D_image" id="Ani3D_image" accept="image/*" onChange={handleImageChange} className="hidden" />
              <label htmlFor="Ani3D_image" className="md:w-40 lg:w-72 mt-4 block bg-purple-600 text-white text-sm lg:text-base text-center py-2 px-4 rounded-lg cursor-pointer hover:bg-green-600">
                เลือกไฟล์รูปภาพ
              </label>
            </div>

            <br />
            <div className="flex items-center justify-center mt-8 text-sm">
              <button className="bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400" onClick={() => navigate("/MovementOfRPD")}>
                ยกเลิก
              </button>
              <button className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600" onClick={handleAddAnimation3D}>
                บันทึก
              </button>
            </div>
          </form>

          {uploading && (
            <div>
              <p>กำลังอัปโหลด: {uploadProgress.toFixed(2)}%</p>
              <progress value={uploadProgress} max="100"></progress>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovementOfRPD;
