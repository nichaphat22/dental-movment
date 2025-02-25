import React, { useState } from "react";
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

const AddUser = ({ isOpen, onClose }) => {
  const [type, setType] = useState("card");
  const currentYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

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
              <form className="mt-6 flex flex-col gap-4">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    ชื่อ
                  </Typography>
                  <input
                    type="text"
                    placeholder="กรอกชื่อ..."
                    className="border w-full p-2 rounded-md"
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
                    placeholder="..."
                    className="border w-full p-2 rounded-md"
                  />
                </div>
                <div className="flex justify-between">
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-2 font-medium"
                    >
                      section
                    </Typography>
                    <input
                      type="number"
                      name="sec"
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-2 font-medium"
                    >
                      ปีการศึกษา
                    </Typography>
                    <select className="border w-full p-2.5 rounded-md max-h-48 overflow-y-auto">
                      {years.map((year) => (
                        <option
                          key={year}
                          value={year}
                          className="flex items-center gap-2"
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    role
                  </Typography>

                  <div className="flex justify-between space-x-1 text-center">
                  <div className="w-full p-1 border rounded-2xl shadow-inner cursor-pointer hover:bg-indigo-50">
                    <input type="radio" className=" hidden" />
                    นักศึกษา
                  </div>
                  <div className="w-full p-1 border rounded-2xl shadow-inner cursor-pointer hover:bg-indigo-50">
                    <input type="radio" className=" hidden" />
                    บุคคลภายนอก
                  </div>
                  </div>
                  
                </div>
              </form>
               {/* Buttons */}
               <div className='flex justify-center mt-4'>
                    <button className='bg-gray-500 text-white px-4 py-2 rounded mr-2' onClick={onClose}>
                        ยกเลิก
                    </button>
                    <button
                        className="px-4 py-2 rounded  bg-blue-500 text-white"
                    
                    >
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
