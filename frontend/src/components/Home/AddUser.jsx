import React, { useState } from "react";
import axios from "axios";
import { API } from "../../api/api";
import { GoX } from "react-icons/go";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import th from "date-fns/locale/th";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Typography,
  Input,
  Option,
} from "@material-tailwind/react";
import { baseUrl } from "../../utils/services";
import Swal from "sweetalert2";

const AddUser = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState("card");
  const currentYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [studentID, setStudentID] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [studentIDError, setStudentIDError] = useState("");
  const token = localStorage.getItem("token"); // หรือดึงจาก Context/Auth State
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("❌ กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateName = (name) => {
    const namePattern = /^[a-zA-Zก-๙\s'-]{2,50}$/;
    if (!namePattern.test(name)) {
      setNameError("ชื่อไม่ควรมีตัวเลขหรืออักขระพิเศษ");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateStudentID = (studentID) => {
    const studentIDPattern = /^\d{9}-\d{1}$/;
    if (!studentIDPattern.test(studentID)) {
      setStudentIDError(
        "รหัสนักศึกษาควรมีรูปแบบ 9 หลักตามด้วย - และอีก 1 หลัก"
      );
      return false;
    }
    setStudentIDError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !studentID.trim() || !email.trim()) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // const isNameValid = validateName(name);
    // const isEmailValid = validateEmail(email);
    // const isStudentIDValid = validateStudentID(studentID);

    // ตรวจสอบการ Validate ทั้งสามฟังก์ชัน
    if (
      !validateEmail(email) ||
      !validateName(name) ||
      !validateStudentID(studentID)
    ) {
      return;
    }

    try {
      const res = await axios.post(
        `${baseUrl}/auth/addUser`,
        {
          name,
          email,
          role,
          studentID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ส่ง token ไปใน request
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "เพิ่มข้อมูลสำเร็จ",
        text: res.data.message || "เพิ่มรายชื่อสำเร็จ",
        confirmButtonText: "ตกลง",
      }).then(() => {
        setName("");
        setEmail("");
        setRole("student");
        setStudentID("");
        if (onSuccess) onSuccess();
        onClose();
      });

      

      // setMessage(`✅ ${res.data.message}`);
    } catch (error) {
      // setMessage(`${error.response?.data?.message || "Error occurred"}`);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text:
          error.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มรายชื่อ",
      });
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const [selectedFileName, setSelectedFileName] = useState(""); // เก็บชื่อไฟล์

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
        setMessage("กรุณาเลือกไฟล์ Excel (.xls, .xlsx)");
        setSelectedFileName(""); // เคลียร์ชื่อไฟล์ถ้าไม่ใช่ Excel
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage("ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10MB");
        setSelectedFileName(""); // เคลียร์ชื่อไฟล์
        return;
      }
      setFile(file);
      setSelectedFileName(file.name); // อัปเดตชื่อไฟล์
    }
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    // setIsLoading(true);

    if (!file) {
      setMessage("กรุณาเลือกไฟล์");
      // setIsLoading(false);
      return;
    }

    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    Swal.fire({
      title: "กำลังอัปโหลด...",
      html: `
        <div id="progress-container" style={"width: 100%; background:#eee; border-radius: 4px; "}>
          
        </div>
        
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
    });

    try {
      const res = await axios.post(
        `${baseUrl}/auth/uploadStudent`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ส่ง token ไปใน request
          },
          // onUploadProgress: (ProgressEvent) => {
          //   const percent = Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total);
          //   setUploadProgress(percent);

          //   const progressBar = document.getElementById("progress-bar");
          //   const progressText = document.getElementById("progress-text");
          //   if (progressBar && progressText) {
          //     progressBar.style.width = `${percent}%`;
          //     progressText.textContent = `${percent}%`;
          //   }
          // },
        }
      );

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "เพิ่มข้อมูลสำเร็จ",
        text: res.data.message || "เพิ่มรายชื่อสำเร็จ",
        confirmButtonText: "ตกลง",
      }).then(() => {
        setExcelData(res.data);
        setFile(null);
        setSelectedFileName("");
        setMessage("");
        if (onSuccess) onSuccess();
        onClose();
      });
      // setMessage(res.data.message || "อัปโหลดไฟล์สำเร็จ");
    } catch (error) {
      console.error("Error uploading file:", error);

      // ตรวจสอบข้อมูล error.response
      if (error.response) {
        console.log("Response data:", error.response.data); // ข้อมูลตอบกลับจากเซิร์ฟเวอร์
        console.log("Response status:", error.response.status); // สถานะ HTTP
        console.log("Response headers:", error.response.headers); // headers ที่ตอบกลับ

        setMessage(
          error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์"
        );
      } else {
        setMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    } 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {/* header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">เพิ่มรายชื่อนักศึกษา</h2>
          <div onClick={onClose} className="cursor-pointer">
            <GoX className="w-5 h-5" />
          </div>
        </div>
        {/* tab */}
        <Tabs value={type} className="overflow-visible">
          <TabsHeader className="relative z-0 bg-gray-200">
            <Tab value="card" onClick={() => setType("card")}>
              เพิ่มรายชื่อ
            </Tab>
            <Tab value="excel" onClick={() => setType("excel")}>
              เพิ่มรายชื่อจาก Excel
            </Tab>
          </TabsHeader>
          <TabsBody
            className="!overflow-x-hidden !overflow-y-visible"
            animate={{
              initial: {
                x: type === "card" ? 400 : -400,
              },
              mount: {
                x: 0,
              },
              unmount: {
                x: type === "card" ? 400 : -400,
              },
            }}
          >
            {/* Form สำหรับเพิ่มรายชื่อ */}
            <TabPanel value="card" className="p-0">
              {message && <p className="mb-4 text-red-600">{message}</p>}
              <form className="mt-6 flex flex-col gap-4">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    ชื่อ:
                  </Typography>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => validateName(name)}
                    placeholder="กรอกชื่อ..."
                    className="border w-full p-2 rounded-md"
                    required
                  />
                </div>
                {nameError && (
                  <p className="text-red-600 text-sm">{nameError}</p>
                )}
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    Email:
                  </Typography>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => validateEmail(email)}
                    placeholder="กรอกอีเมล..."
                    className="border w-full p-2 rounded-md"
                    required
                  />
                  {emailError && (
                    <p className="text-red-600 text-sm">{emailError}</p>
                  )}
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    รหัสนักศึกษา:
                  </Typography>
                  <input
                    type="text"
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                    onBlur={() => validateStudentID(studentID)}
                    placeholder="กรอกรหัสนักศึกษา..."
                    className="border w-full p-2 rounded-md"
                    required
                  />
                  {studentIDError && (
                    <p className="text-red-600 text-sm">{studentIDError}</p>
                  )}
                </div>
                {/* {message && <p className="mb-4 text-red-600">{message}</p>}   */}
              </form>
              {/* Buttons */}
              <div className="flex justify-center mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                  onClick={onClose}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded  bg-blue-500 text-white"
                >
                  บันทึก
                </button>
              </div>
            </TabPanel>

            {/* Form สำหรับเพิ่มรายชื่อจาก Excel */}
            <TabPanel value="excel" className="p-0">
              <div className="mt-6">
                <form onSubmit={handleSubmitFile}>
                  <label className="text-blue-500 font-medium border p-6 text-center cursor-pointer block">
                    <p>เพิ่มไฟล์</p>
                    {/* แสดงชื่อไฟล์ที่เลือก */}
                    {selectedFileName && (
                      <p className="mt-2 text-center text-gray-600">
                        ไฟล์ที่เลือก: {selectedFileName}
                      </p>
                    )}

                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".xls,.xlsx"
                      className="hidden"
                    />
                  </label>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 mt-4 bg-blue-500 text-white rounded"
                    >
                      อัปโหลด
                    </button>
                  </div>
                </form>
                {message && <div>{message}</div>}

                {/* Show excel data table if available */}
                {excelData.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold">ข้อมูลจากไฟล์ Excel:</h2>
                    <table className="w-full table-auto mt-4">
                      <thead>
                        <tr>
                          <th className="border px-4 py-2">Student ID</th>
                          <th className="border px-4 py-2">Name</th>
                          <th className="border px-4 py-2">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.map((row, index) => (
                          <tr key={index}>
                            <td className="border px-4 py-2">
                              {row.studentID}
                            </td>
                            <td className="border px-4 py-2">{row.name}</td>
                            <td className="border px-4 py-2">{row.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default AddUser;
