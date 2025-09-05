import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../utils/services";
import { backendUrl } from "../../../utils/services";
import { HiUpload } from "react-icons/hi";
import { TbFile } from "react-icons/tb";
import { Button, Input } from "@chakra-ui/react";
import { RxCross2 } from "react-icons/rx";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
import "react-toastify/dist/ReactToastify.css";

function Add_RPD() {
  const [modelName, setModelName] = useState("");
  const [fileModel, setFileModel] = useState(null);
  const [filePattern, setFilePattern] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const [fileMarker, setFileMarker] = useState(null);

  const [models, setModels] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get(`${baseUrl}/model`);
        setModels(res.data.data || []);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  const handleFileChange = (event, setter) => {
    setter(event.target.files[0]);
  };

  const handleSaveModel = async (event) => {
    event.preventDefault();

    // ตรวจสอบว่าไฟล์และชื่อโมเดลครบถ้วน
    if (!modelName || !fileImage || !filePattern || !fileModel) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      return;
    }

    // ตรวจสอบว่าโมเดลชื่อเดียวกันมีอยู่แล้ว
    const existingModel = models.find(
      (model) =>
        model.name.trim().toLowerCase() === modelName.trim().toLowerCase()
    );
    if (existingModel) {
      Swal.fire({
        title: "ชื่อโมเดลนี้ถูกใช้ไปแล้ว",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", modelName.trim());
      formData.append("modelFile", fileModel);
      formData.append("patternFile", filePattern);
      formData.append("imageFile", fileImage);
      formData.append("markerFile", fileMarker); // ต้องมี state fileMarker

      // เปิด Swal กำลังอัปโหลด
      Swal.fire({
        title: "กำลังอัปโหลดโมเดล...",
       html: `
        <p> โปรดรอสักครู่ <b id="progress-text">0%</b></p>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // send post to backend API
      const response = await axios.post(`${baseUrl}/model/model3d`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);

            // อัปเดต progress bar + text ใน Swal
            const progressBar =
              Swal.getHtmlContainer().querySelector("#swal-progress-bar");
            const progressText =
              Swal.getHtmlContainer().querySelector("#progress-text");
            if (progressBar) progressBar.style.width = percent + "%";
            if (progressText) progressText.textContent = percent + "%";
          }
        },
      });

      // **บันทึกข้อมูลโมเดลพร้อม ID**
      const newModel = response.data.data;

      // เช็ก _id ก่อน push
      if (!newModel._id) {
        throw new Error("โมเดลที่บันทึกใหม่ไม่มี _id");
      }

      // อัปเดตสถานะของโมเดลใน state
      setModels([...models, newModel]);
      setUploading(false);
      setUploadProgress(0);

      // แจ้งเตือนเมื่อเพิ่มโมเดลสำเร็จ
      Swal.fire({
        title: "เพิ่มโมเดลสำเร็จ!",
        text: "โมเดลของคุณถูกเพิ่มเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/Possible-Movement-Of-RPD-teacher");
        }
      });
    } catch (error) {
      console.error("ไม่สามารถบันทึกโมเดลได้", error);
      setUploading(false);
      setUploadProgress(0);
      Swal.close();
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกโมเดลได้", "error");
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
        navigate("/Possible-Movement-Of-RPD-teacher");
      }
    });
  };

  // ฟังก์ชันในการลบไฟล์
  const handleDeleteFile = (fileType) => {
    if (fileType === "model") {
      setFileModel(null);
    } else if (fileType === "pattern") {
      setFilePattern(null);
    } else if (fileType === "image") {
      setFileImage(null);
    }
  };

  return (
    <div
      className="Content"
      style={{ backgroundColor: "#fff", color: "#000", margin: "0" }}
    >
      <div style={{ margin: "20px" }}>
        <ToastContainer />
        <h3 style={{ fontSize: "1.5rem", margin: "0", marginBottom: "" }}>
          เพิ่มสื่อการสอน RPD sample case
        </h3>

        <form
          encType="multipart/form-data"
          onSubmit={handleSaveModel}
          style={{ marginTop: "15px" }}
        >
          {/* name model */}
          <div
            className="filepattern-display"
            style={{
              borderRadius: "5px",
              padding: "20px 30px",
              boxShadow:
                "rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px",
              background: "#fff",
              marginBottom: "20px",
            }}
          >
            <label htmlFor="modelName" className="lebel-bio">
              ชื่อโมเดล: <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                border: "1px solid #d0d0d0",
                borderRadius: "5px",
                height: "45px",
                resize: "none",
                background: "#f5f5f5",
                overflow: "hidden",
              }}
              wrap="soft"
              value={modelName}
              onChange={(e) => {
                setModelName(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              // required
            />
          </div>

          {/* file model */}
          <div
            className="filepattern-display"
            style={{
              borderRadius: "5px",
              padding: "20px 30px",
              boxShadow:
                "rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px",
              background: "#fff",
              marginBottom: "20px",
            }}
          >
            <label htmlFor="" className="lebel-bio">
              ไฟล์โมเดล :{" "}
              <span style={{ color: "red" }}>
                *ไฟล์โมเดลต้องเป็น .glb หรือ .gltf เท่านั้น (แนะนำ .glb)
              </span>
            </label>
            <div>
              <Input
                type="file"
                id="model-file"
                onChange={(e) => handleFileChange(e, setFileModel)}
                accept=".obj,.gltf,.glb,.stl" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
                name="model-file"
                // required
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: "5px",
                  fontSize: "14px",
                  borderRadius: "5px",
                  padding: "10px",
                  background: "rgb(145, 54, 205)",
                  color: "#fff",
                  boxShadow:
                    "rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset",
                }}
                onClick={() => document.querySelector("#model-file").click()} // คลิก input เมื่อคลิกปุ่ม
              >
                <HiUpload /> อัปโหลดไฟล์
              </Button>

              {fileModel && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    background: "rgb(237, 237, 237)",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    boxShadow:
                      "rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      alignItems: "center",
                    }}
                  >
                    <TbFile
                      size={22}
                      style={{ marginRight: "10px", color: "#52525b" }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          textOverflow: "ellipsis",
                          fontWeight: "450",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          fontSize: "14px",
                        }}
                      >
                        {fileModel.name}
                      </div>
                      {/* <div style={{ fontSize: '12px', color: '#444444' }}>{fileModel.size}</div> */}
                    </div>
                  </div>
                  {/* ปุ่มลบไฟล์ */}
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      marginLeft: "auto", // ช่วยให้ปุ่มไปที่ขวาสุด
                    }}
                    onClick={() => handleDeleteFile("model")}
                  >
                    <RxCross2 color="#52525b" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* file pattern */}
          <div
            className="filepattern-display"
            style={{
              borderRadius: "5px",
              padding: "20px 30px",
              boxShadow:
                "rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px",
              background: "#fff",
              marginBottom: "20px",
            }}
          >
            <label htmlFor="" className="lebel-bio">
              ไฟล์ Pattern :{" "}
              <span style={{ color: "red" }}>*ไฟล์ Pattern ต้องเป็น .patt</span>
            </label>
            <div>
              <Input
                type="file"
                id="pattern-file"
                name="pattern-file"
                onChange={(e) => handleFileChange(e, setFilePattern)}
                accept=".patt" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: "5px",
                  fontSize: "14px",
                  borderRadius: "5px",
                  padding: "10px",
                  background: "rgb(145, 54, 205)",
                  color: "#fff",
                  boxShadow:
                    "rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset",
                }}
                onClick={() => document.querySelector("#pattern-file").click()} // คลิก input เมื่อคลิกปุ่ม
              >
                <HiUpload /> อัปโหลดไฟล์
              </Button>

              {filePattern && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    background: "rgb(237, 237, 237)",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    boxShadow:
                      "rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      alignItems: "center",
                    }}
                  >
                    <TbFile
                      size={22}
                      style={{ marginRight: "10px", color: "#52525b" }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          textOverflow: "ellipsis",
                          fontWeight: "450",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          fontSize: "14px",
                        }}
                      >
                        {filePattern.name}
                      </div>
                      {/* <div style={{ fontSize: '12px', color: '#444444' }}>{filePattern.size}</div> */}
                    </div>
                  </div>
                  {/* ปุ่มลบไฟล์ */}
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      marginLeft: "auto", // ช่วยให้ปุ่มไปที่ขวาสุด
                    }}
                    onClick={() => handleDeleteFile("pattern")}
                  >
                    <RxCross2 color="#52525b" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* file marker */}
          <div
            className="filepattern-display"
            style={{
              borderRadius: "5px",
              padding: "20px 30px",
              boxShadow:
                "rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px",
              background: "#fff",
              marginBottom: "20px",
            }}
          >
            <label htmlFor="" className="lebel-bio">
              ไฟล์ Marker : <span style={{ color: "red" }}>*</span>
            </label>
            <div>
              <Input
                type="file"
                id="marker-file"
                onChange={(e) => handleFileChange(e, setFileMarker)}
                accept=".jpg,.jpeg,.png,.svg" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
                name="marker-file"
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: "5px",
                  fontSize: "14px",
                  borderRadius: "5px",
                  padding: "10px",
                  background: "rgb(145, 54, 205)",
                  color: "#fff",
                  boxShadow:
                    "rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset",
                }}
                onClick={() => document.querySelector("#marker-file").click()} // คลิก input เมื่อคลิกปุ่ม
              >
                <HiUpload /> อัปโหลดไฟล์
              </Button>

              {fileMarker && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    background: "rgb(237, 237, 237)",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    boxShadow:
                      "rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      alignItems: "center",
                    }}
                  >
                    <TbFile
                      size={22}
                      style={{ marginRight: "10px", color: "#52525b" }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          textOverflow: "ellipsis",
                          fontWeight: "450",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          fontSize: "14px",
                        }}
                      >
                        {fileMarker.name}
                      </div>
                    </div>
                  </div>
                  {/* ปุ่มลบไฟล์ */}
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      marginLeft: "auto", // ช่วยให้ปุ่มไปที่ขวาสุด
                    }}
                    onClick={() => handleDeleteFile("image")}
                  >
                    <RxCross2 color="#52525b" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* file image */}
          <div
            className="filepattern-display"
            style={{
              borderRadius: "5px",
              padding: "20px 30px",
              boxShadow:
                "rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px",
              background: "#fff",
              marginBottom: "20px",
            }}
          >
            <label htmlFor="" className="lebel-bio">
              ไฟล์รูปภาพ : <span style={{ color: "red" }}>*</span>
            </label>
            <div>
              <Input
                type="file"
                id="image-file"
                onChange={(e) => handleFileChange(e, setFileImage)}
                accept=".jpg,.jpeg,.png,.svg" // กำหนดชนิดไฟล์ที่รองรับ
                display="none" // ซ่อน input
                name="image-file"
              />
              <Button
                variant="outline"
                size="sm"
                style={{
                  marginBottom: "5px",
                  fontSize: "14px",
                  borderRadius: "5px",
                  padding: "10px",
                  background: "rgb(145, 54, 205)",
                  color: "#fff",
                  boxShadow:
                    "rgba(175, 175, 175, 0.74) 0px 2px 2px, rgba(227, 227, 227, 0.82) 0px 2px 10px 1px, rgba(71, 24, 95, 0.23) 0px -3px 0px inset",
                }}
                onClick={() => document.querySelector("#image-file").click()} // คลิก input เมื่อคลิกปุ่ม
              >
                <HiUpload /> อัปโหลดไฟล์
              </Button>

              {fileImage && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    background: "rgb(237, 237, 237)",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    boxShadow:
                      "rgba(70, 71, 75, 0.31) 0px 0px 0.2em, rgba(100, 100, 100, 0.05) 0px 0.2em 1em",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      alignItems: "center",
                    }}
                  >
                    <TbFile
                      size={22}
                      style={{ marginRight: "10px", color: "#52525b" }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          textOverflow: "ellipsis",
                          fontWeight: "450",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          fontSize: "14px",
                        }}
                      >
                        {fileImage.name}
                      </div>
                    </div>
                  </div>
                  {/* ปุ่มลบไฟล์ */}
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      marginLeft: "auto", // ช่วยให้ปุ่มไปที่ขวาสุด
                    }}
                    onClick={() => handleDeleteFile("image")}
                  >
                    <RxCross2 color="#52525b" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* button */}
          <div className="" style={{ marginBottom: "40px" }}>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              ยกเลิก
            </button>
            <button type="submit" className="add-button">
              บันทึก
            </button>
          </div>
        </form>

        {uploading && (
          <div style={{ marginLeft: "20px" }}>
            <div
              className={`upload-status ${uploadProgress < 100 ? "uploading" : "completed"}`}
            >
              Status: {uploadProgress < 100 ? "Uploading" : "Completed"}
            </div>
            <div>
              Progress:{" "}
              {uploadProgress < 100 ? `${uploadProgress.toFixed(2)}%` : "100%"}
            </div>
            <progress value={uploadProgress} max="100"></progress>
          </div>
        )}
      </div>
    </div>
  );
}

export default Add_RPD;
