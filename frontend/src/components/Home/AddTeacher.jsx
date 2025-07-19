import React, { useState } from "react";
import axios from "axios";
import { GoX } from "react-icons/go";
import "react-datepicker/dist/react-datepicker.css";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Typography,
} from "@material-tailwind/react";
import { baseUrl } from "../../utils/services";
import Swal from "sweetalert2";

const AddTeacher = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  //ดักคำที่ไม่ควรใช้
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateName = (name) => {
    const namePattern = /^[a-zA-Zก-๙\s'-]{2,50}$/;
    if (!namePattern.test(name)) {
      setNameError("ไม่ควรมีตัวเลขและตัวอักขระพิเศษ");
      return false;
    }
    setNameError("");
    return true;
  };

  //ปุ่ม Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !email.trim()) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!validateEmail(email) || !validateName(name)) {
      return;
    }

    try {
      const res = await axios.post(
        `${baseUrl}/auth/addUser`,
        {
          email,
          name,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        setRole("teacher");
        if (onSuccess) onSuccess();
        onClose();
      });
      // setMessage(`${res.data.message}`);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {/* header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">เพิ่มรายชื่อผู้สอบ</h2>
          <div onClick={onClose} className="cursor-pointer">
            <GoX className="w-5 h-5" />
          </div>
        </div>
        {/* form */}
        <div className="p-0">
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
              {nameError && <p className="text-red-600 text-sm">{nameError}</p>}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;
