import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./MovementOfRPD.css";
import { baseUrl } from "../../../utils/services";
import { backendUrl } from "../../../utils/services";
import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Edit_MovementOfRPD() {
  const location = useLocation();
  const [animationName, setAnimationName] = useState("");
  const [description, setDescription] = useState("");
  const [existingAnimation, setExistingAnimation] = useState("");
  const [existingAnimationName, setExistingAnimationName] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [existingImageName, setExistingImageName] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchAnimationData = async () => {
      if (!location.state || !location.state._id) {
        console.error("Animation id is not defined.");
        return;
      }

      try {
        const res = await fetch(
          `${baseUrl}/animation3D/animation/${location.state._id}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setAnimationName(data.name);
        setDescription(data.description || "");

        setExistingAnimation(`${backendUrl}/${data.animationFile.path}`);
        setExistingAnimationName(data.animationFile.name);

        setExistingImage(`${backendUrl}/${data.imageFile.path}`);
        setExistingImageName(data.imageFile.name);
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

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  }

  const handleUpdateAnimation = async (e) => {
    e.preventDefault();

    if (!animationName.trim()) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกชื่อแอนิเมชัน", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("name", animationName.trim());
    formData.append("description", description.trim());
    if (selectedFile) formData.append("animationFile", selectedFile);
    if (selectedImage) formData.append("imageFile", selectedImage);

    // แสดง Swal กำลังอัปโหลด
    Swal.fire({
      title: 'กำลังอัปเดตแอนิเมชัน...',
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
      xhr.open("PUT", `${baseUrl}/animation3D/update/${location.state._id}`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          Swal.getHtmlContainer().querySelector('b').textContent = percent.toFixed(2);
        }
      };

      xhr.onload = () => {
        Swal.close();
        if (xhr.status >= 200 && xhr.status < 300) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "แอนิเมชันอัปเดตเรียบร้อย",
            icon: "success",
            confirmButtonText: "ตกลง"
          }).then(() => navigate("/MovementOfRPD-teacher"));
        } else {
          Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตแอนิเมชันได้", "error");
        }
      };

      xhr.onerror = () => {
        Swal.close();
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตแอนิเมชันได้", "error");
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Update Error:", error);
      Swal.close();
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตแอนิเมชันได้", "error");
    }
  };

  const handleCancel = () => {
    navigate(`/MovementOfRPD-teacher`);
  };

  return (
    <div className="Content">
      <h1 className="text-lg md:text-xl lg:text-3xl text-center font-bold mt-2.5">
        การเคลื่อนที่ของฟันเทียม
      </h1>
      <div className=" bg-white m-4  ">
        <div className="mb-6 p-4 border rounded-md bg-gray-100">
          <h1 className="mb-2 text-sm md:text-base lg:text-lg">
            Edit Animation
          </h1>
          <form onSubmit={handleUpdateAnimation}>
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

              <label
                htmlFor="Ani3D_description"
                className="mr-3 mb-2 text-sm md:text-base"
              >
                Description:
              </label>
              <textarea
                id="Ani3D_description"
                value={description}
                onChange={handleDescriptionChange}
                className="w-full border border-gray-300 rounded-md p-2 text-xs md:text-sm lg:text-base"
                rows={4}
              />
              <br />

              <label htmlFor="Ani3D_Animation" className="text-sm md:text-base">
                เลือกไฟล์แอนิเมชัน:{" "}
              </label>
              <br />

              {selectedFile ? (
                <div className="flex items-center justify-center bg-gray-100">
                  <video
                    controls
                    className="w-96 lg:w-2/5"
                    src={URL.createObjectURL(selectedFile)}
                  />
                </div>
              ) : (
                existingAnimation && (
                  <div className="flex items-center justify-center bg-gray-100">
                    <video
                      controls
                      className="w-96 lg:w-2/5"
                      src={existingAnimation}
                    />
                  </div>
                )
              )}

              <div className="text-center">
                <p className="mb-1 text-xs md:text-sm lg:text-base">
                  ชื่อไฟล์ :{" "}
                  {selectedFileName || existingAnimationName || "ยังไม่มีไฟล์"}
                </p>
                <button
                type="button"
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

              <label htmlFor="Ani3D_image" className="text-sm md:text-base">
                เลือกไฟล์รูปภาพ:{" "}
              </label>
              <br />

              {selectedImage ? (
                <div className="flex items-center justify-center bg-gray-100">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="w-96 lg:w-2/5 hover:transform-none"
                  />
                </div>
              ) : (
                existingImage && (
                  <div className="flex items-center justify-center bg-gray-100">
                    <img
                      src={existingImage}
                      alt="Existing"
                      className="w-96 lg:w-2/5 hover:transform-none"
                    />
                  </div>
                )
              )}

              <div className="text-center">
                <p className="mt-4 mb-1 text-xs md:text-sm lg:text-base">
                  ชื่อไฟล์ :{" "}
                  {selectedImageName || existingImageName || "ยังไม่มีไฟล์"}
                </p>
                <button
                  type="button"
                  title="เพิ่มรูปภาพ"
                  className="bg-purple-600 text-xs md:text-sm text-white px-3 py-2 rounded mt-1.5 mr-2 mb-4 hover:bg-purple-500"
                  onClick={() => document.getElementById("Ani3D_image").click()}
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

            <hr/>
            <div className="flex items-center justify-center w-full text-xs md:text-sm mt-5">
              <button
                type="button"
                className=" bg-gray-300 text-black px-3 py-2 rounded mr-2 hover:bg-gray-400"
                onClick={handleCancel}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
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
