import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button as BootstrapButton, Spinner } from "react-bootstrap";
import { Button, Input } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";
import { TbFile } from "react-icons/tb";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
import "react-toastify/dist/ReactToastify.css";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { baseUrl } from "../../../utils/services";
import { backendUrl } from "../../../utils/services";

const Edit_RPD = () => {
  const [name, setName] = useState("");
  const [modelName, setModelName] = useState("");
  const [models, setModels] = useState([]);
  const [fileModel, setFileModel] = useState(null);
  const [filePattern, setFilePattern] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const [fileMarker, setFileMarker] = useState(null);
  const [existingModel, setExistingModel] = useState(null);
  const [existingFileModel, setExistingFileModel] = useState(null);
  const [existingFilePattern, setExistingFilePattern] = useState(null);
  const [existingFileMarker, setExistingFileMarker] = useState(null);
  const [exitingFileImage, setExistingFileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState(existingModel || ""); // เริ่มต้นด้วย URL ที่มีอยู่แล้ว
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const location = useLocation();
  const { id } = useParams(); // ดึง id จาก URL
  const navigate = useNavigate();

  console.log(fileModel);

  useEffect(() => {
    console.log("Current Path:", window.location.pathname);
    console.log("Params ID:", id);

    if (!id) {
      console.warn("No ID found, redirecting...");
      navigate("/");
      return;
    }

    const fetchModelData = async () => {
      try {
        const res = await axios.get(`${baseUrl}/model/${id}`);
        const model = res.data;

        // หากมีข้อมูลจาก model ให้ตั้งค่าผลลัพธ์ใน state
        setExistingModel(model); // ตั้งค่า state existingModel แทน
        setModelName(model.name || "");

        if (model?.modelUrl) {
          setExistingFileModel({
            file: null,
            name: getFileNameFromUrl(model.modelUrl),
            url: model.modelUrl,
          });
        }
        if (model?.patternUrl) {
          setExistingFilePattern({
            name: getFileNameFromUrl(model.patternUrl),
            url: model.patternUrl,
          });
        }
        if (model?.markerUrl) {
          setExistingFileMarker({
            name: getFileNameFromUrl(model.markerUrl.path),
            url: model.markerUrl.path,
          });
        }
        if (model?.imageUrl) {
          setExistingFileImage({
            name: getFileNameFromUrl(model.imageUrl),
            url: model.imageUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching model data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModelData();
  }, [id]);

  // ฟังก์ชันดึงชื่อไฟล์จาก URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    try {
      const path = new URL(url, window.location.origin).pathname;
      return decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (existingModel) {
      setModelName(existingModel.name);
      setFileModel({
        name: getFileNameFromUrl(existingModel.modelUrl),
        url: existingModel.modelUrl,
        file: null,
      });

      setFilePattern({
        name: getFileNameFromUrl(existingModel.patternUrl),
        url: existingModel.patternUrl,
        file: null,
      });

      setFileMarker({
        name: getFileNameFromUrl(existingModel.markerUrl),
        url: existingModel.markerUrl.path,
        file: null,
      });

      setFileImage({
        name: getFileNameFromUrl(existingModel.imageUrl),
        url: existingModel.imageUrl,
        file: null,
      });
    }
  }, [existingModel]);

  // ฟังก์ชันในการจัดการการอัปโหลดไฟล์ใหม่
  const handleFileChange = (event, fileType) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newFile = files[0];

      const fileData = {
        name: newFile.name,
        file: newFile, // ⭐ เก็บไฟล์จริง
        url: URL.createObjectURL(newFile), // ใช้แค่ preview
        size: (newFile.size / 1024 / 1024).toFixed(1) + " MB",
      };

      if (fileType === "model") {
        setFileModel(fileData);
      } else if (fileType === "pattern") {
        setFilePattern(fileData);
      } else if (fileType === "image") {
        setFileImage(fileData);
      } else if (fileType === "marker") {
        setFileMarker(fileData);
      }
    }
  };

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
  };

  // ฟังก์ชันในการลบไฟล์
  const handleDeleteFile = (fileType) => {
    if (fileType === "model") {
      setFileModel(null);
    } else if (fileType === "pattern") {
      setFilePattern(null);
    } else if (fileType === "image") {
      setFileImage(null);
    } else if (fileType === "marker") {
      setFileMarker(null);
    }
  };

  // ฟังก์ชันการบันทึกข้อมูล (ซึ่งรวมถึงการลบไฟล์เก่าและอัปโหลดไฟล์ใหม่)
  const handleSaveModel = async (event) => {
    event.preventDefault();
    setUploading(true);
    // let isChanged = false;

    try {
      // ตรวจสอบการเปลี่ยนแปลง
      const hasFileChange =
        fileModel?.file ||
        filePattern?.file ||
        fileImage?.file ||
        fileMarker?.file;
      const hasNameChange = modelName;

      if (!hasFileChange && !hasNameChange) {
        Swal.fire({
          title: "คุณยังไม่ได้ทำการแก้ไขข้อมูล",
          icon: "info",
          confirmButtonText: "ตกลง",
        });
        setUploading(false);
        return;
      }

      const formData = new FormData();

      if (hasNameChange) {
        formData.append("name", modelName);
      }

      // upload model
      if (fileModel && fileModel.file) {
        formData.append("modelFile", fileModel.file);
        // isChanged = true;
      }

      //upload pattern
      if (filePattern && filePattern.file) {
        formData.append("patternFile", filePattern.file);
        // isChanged = true;
      }
      //upload marker
      if (fileMarker && fileMarker.file) {
        formData.append("markerFile", fileMarker.file);
        // isChanged = true;
      }

      //upload image
      if (fileImage && fileImage.file) {
        formData.append("imageFile", fileImage.file);
      }
      // เปิด Swal progress
      Swal.fire({
        title: "กำลังอัปเดตโมเดล...",
        html: `
        <p> โปรดรอสักครู่ <b id="progress-text">0%</b></p>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // api backend
      await axios.put(`${baseUrl}/model/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
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

      setUploading(false);
      setUploadProgress(0);

      Swal.close();
      // แจ้งเตือนเมื่อเพิ่มโมเดลสำเร็จ
      Swal.fire({
        title: "อัปเดตโมเดลสำเร็จ!",
        text: "โมเดลของคุณอัปเดตเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/Possible-Movement-Of-RPD-teacher");
        }
      });
    } catch (error) {
      console.error("ไม่สามารถอัปเดตโมเดลได้", error);
      setUploading(false);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตโมเดลได้", "error");
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

  return (
    <div className="Content" style={{ backgroundColor: "#fff", color: "#000" }}>
      <div style={{ margin: "20px" }}>
        <ToastContainer />
        <h3 style={{ margin: "0", fontSize: "1.5rem", marginBottom: "15px" }}>
          แก้ไขโมเดล
        </h3>
        {loading ? (
          <Button
            variant=""
            disabled
            style={{
              display: "flex", // ใช้ flex เพื่อให้เนื้อหาภายในจัดแนวในแนวนอน
              background: "none",
              border: "none",
              margin: "auto",
              alignItems: "center", // ทำให้สปินเนอร์และข้อความอยู่ตรงกลาง
            }}
          >
            <Spinner
              as="span"
              animation="grow"
              //  size="lg"
              role="status"
              aria-hidden="true"
              style={{
                marginRight: "5px",
                background: "rgb(168, 69, 243)",
                width: "25px", // ปรับขนาดของสปินเนอร์
                height: "25px",
              }}
            />
            กำลังโหลด...
          </Button>
        ) : (
          <form
            encType="multipart/form-data"
            onSubmit={handleSaveModel}
            style={{ marginTop: "15px" }}
          >
            {/* model name */}
            <div
              className="modelName-display"
              style={{
                borderRadius: "5px",
                padding: "20px 30px",
                boxShadow:
                  "rgba(129, 129, 129, 0.3) 0px 1px 2px 0px, rgba(202, 202, 202, 0.5) 0px 1px 3px 1px",
                marginBottom: "20px",
              }}
            >
              <input type="hidden" value={existingModel?.name || ""} />

              <label htmlFor="name" className="lebel-bio">
                ชื่อโมเดล :
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
                onChange={handleModelNameChange}
              />
            </div>

            {/* model file */}
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
              </label>

              <div>
                <Input
                  type="file"
                  id="model-file"
                  onChange={(e) => handleFileChange(e, "model")}
                  accept=".obj,.gltf,.glb,.stl" // กำหนดชนิดไฟล์ที่รองรับ
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
                  onClick={() => document.querySelector("#model-file").click()} // คลิก input เมื่อคลิกปุ่ม
                >
                  <HiUpload /> อัปโหลดไฟล์
                </Button>

                {(fileModel || existingFileModel) && (
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 450,
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            fontSize: "14px",
                          }}
                        >
                          {fileModel?.name ||
                            existingFileModel?.name ||
                            "ยังไม่มีไฟล์"}
                        </span>
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

            {/* pattern file */}
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
              </label>

              <div>
                <Input
                  type="file"
                  id="pattern-file"
                  onChange={(e) => handleFileChange(e, "pattern")}
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
                  onClick={() =>
                    document.querySelector("#pattern-file").click()
                  } // คลิก input เมื่อคลิกปุ่ม
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

            {/* marker file */}
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
                ไฟล์ Marker :{" "}
              </label>

              <div>
                <Input
                  type="file"
                  id="marker-file"
                  onChange={(e) => handleFileChange(e, "merker")}
                  accept=".jpg,.jpeg,.png,.svg" // กำหนดชนิดไฟล์ที่รองรับ
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
                      onClick={() => handleDeleteFile("marker")}
                    >
                      <RxCross2 color="#52525b" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* image file */}
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
                ไฟล์รูปภาพ :{" "}
              </label>

              <div>
                <Input
                  type="file"
                  id="image-file"
                  onChange={(e) => handleFileChange(e, "image")}
                  accept=".jpg,.jpeg,.png,.svg" // กำหนดชนิดไฟล์ที่รองรับ
                  display="none" // ซ่อน input
                />
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    marginTop: "10px",
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
                        {/* <div style={{ fontSize: '12px', color: '#444444' }}>{fileImage.size}</div> */}
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

            <br />
            {/* button */}
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
          </form>
        )}

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
};

export default Edit_RPD;
