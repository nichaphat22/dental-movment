import React, { useState } from "react";
import axios from "axios";
import {API} from "../../api/api";
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

const AddUser = ({ isOpen, onClose }) => {
  const [type, setType] = useState("card");
  const currentYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [studentID, setStudentID] = useState("");
  const token = localStorage.getItem("token"); // หรือดึงจาก Context/Auth State

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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

      setMessage(`✅ ${res.data.message}`);
      setName("");
      setEmail("");
      setRole("student");
      setStudentID("");
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || "Error occurred"}`);
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
              <form
                className="mt-6 flex flex-col gap-4"
                
              >
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
                    placeholder="กรอกชื่อ..."
                    className="border w-full p-2 rounded-md"
                    required
                  />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    Email
                  </Typography>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="..."
                    className="border w-full p-2 rounded-md"
                    required
                  />
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
                    placeholder="กรอกรหัสนักศึกษา..."
                    className="border w-full p-2 rounded-md"
                    required
                  />
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
                className="px-4 py-2 rounded  bg-blue-500 text-white">
                  บันทึก
                </button>
              </div>
            </TabPanel>

            {/* Form สำหรับเพิ่มรายชื่อจาก Excel */}
            <TabPanel value="excel" className="p-0">
              <div className="mt-6">
                <Typography variant="small" color="blue-gray" className="mb-2">
                  อัพโหลดไฟล์ Excel
                </Typography>
                <input type="file" accept=".xlsx, .xls" className="w-full" />
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default AddUser;
