import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiImage, FiVideo } from "react-icons/fi";
import { baseUrl } from "../../../utils/services";

function MovementOfRPD() {
  const [newAnimationName, setNewAnimationName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const navigate = useNavigate();

  const validateName = (value) => {
    // ตัดช่องว่างหน้า-หลัง แล้วเช็คว่าชื่อว่างเปล่าหรือเป็นช่องว่างล้วนๆ
    if (!value.trim()) {
      setNameError("กรุณากรอกชื่อ ห้ามเป็นค่าว่างหรือเว้นวรรคเพียงอย่างเดียว");
      return false;
    }
    setNameError("");
    return true;
  };

  // Handle file and image changes
  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);
  const handleImageChange = (event) => setSelectedImage(event.target.files[0]);

  // Function to add new animation
  const handleAddAnimation3D = async (e) => {
    e.preventDefault();

    if (
      !validateName(newAnimationName) ||
      !description.trim() ||
      !selectedFile ||
      !selectedImage
    ) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("name", newAnimationName.trim());
    formData.append("description", description.trim());
    formData.append("animationFile", selectedFile);
    formData.append("imageFile", selectedImage);

    // แสดง Swal กำลังอัปโหลด
    Swal.fire({
      title: 'กำลังอัปโหลด...',
      html: 'โปรดรอสักครู่ <b>0</b>%',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    });

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${baseUrl}/animation3D/uploadAnimation`, true);

       xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          // อัปเดตเปอร์เซนต์ใน Swal
          Swal.getHtmlContainer().querySelector('b').textContent = percent.toFixed(2);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 201) {
          Swal.fire({ icon: "success", title: "อัปโหลดสำเร็จ!" }).then(() => {
            navigate("/MovementOfRPD-teacher");
          });
        } else {
          Swal.fire({ icon: "error", title: "อัปโหลดไม่สำเร็จ" });
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการอัปโหลด" });
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Upload Error:", error);
      setUploading(false);
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    }
  };

  return (
    <div>
      <h1 className="ml-4 text-xl md:text-2xl">การเคลื่อนที่ของฟันเทียม</h1>
      <div className="flex justify-center">
        <div className="border mt-3 rounded-md bg-gray-100 p-6 max-w-6xl w-full mx-auto">
          <h1 className="text-base md:text-lg">เพิ่ม Animation ใหม่</h1>
          <form>
            <div>
              <label htmlFor="newAnimationName" className="mt-2 mb-1.5">
                ชื่อแอนิเมชัน:
              </label>
              <br />
              <input
                type="text"
                id="newAnimationName"
                value={newAnimationName}
                onBlur={() => validateName(newAnimationName)}
                onChange={(e) => setNewAnimationName(e.target.value)}
                className="w-11/12 p-2 border rounded-md"
                placeholder="กรอกชื่อแอนิเมชัน"
              />
              {nameError && <p className="text-red-600 text-sm">{nameError}</p>}
            </div>

            <div>
              {/* description */}
              <label htmlFor="description" className="mt-2 mb-1.5">
                คำอธิบาย:
              </label>
              <br />
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-11/12 p-2 border rounded-md min-h-[100px]"
                placeholder="กรอกคำอธิบายเพิ่มเติม..."
              ></textarea>
               {nameError && <p className="text-red-600 text-sm">{nameError}</p>}
            </div>

            <div className="relative text-center flex justify-center mb-2 mt-4">
              {selectedFile ? (
                <video
                  controls
                  src={URL.createObjectURL(selectedFile)}
                  className="w-full max-w-md aspect-video rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full max-w-md h-48 flex items-center justify-center border border-dashed text-gray-500 rounded-lg">
                  <FiVideo className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <input
                type="file"
                name="Ani3D_animation"
                id="Ani3D_animation"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="Ani3D_animation"
                className="md:w-40 lg:w-72 block bg-purple-600 text-white text-sm lg:text-base text-center py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-600"
              >
                เลือกไฟล์วิดีโอ
              </label>
            </div>

            <div className="relative text-center flex justify-center mt-14">
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="max-w-md h-52 object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full max-w-md h-48 flex items-center justify-center border border-dashed text-gray-500 rounded-lg">
                  <FiImage className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <input
                type="file"
                name="Ani3D_image"
                id="Ani3D_image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="Ani3D_image"
                className="md:w-40 lg:w-72 mt-4 block bg-purple-600 text-white text-sm lg:text-base text-center py-2 px-4 rounded-lg cursor-pointer hover:bg-green-600"
              >
                เลือกไฟล์รูปภาพ
              </label>
            </div>

            <br />
            <div className="flex items-center justify-center mt-8 text-sm">
              <button
                className="bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
                onClick={() => navigate("/MovementOfRPD-teacher")}
              >
                ยกเลิก
              </button>
              <button
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                onClick={handleAddAnimation3D}
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

export default MovementOfRPD;
