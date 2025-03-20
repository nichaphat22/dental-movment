import React, { useEffect, useState } from "react";
import {
  GoChevronDown,
  GoChevronUp,
  GoPencil,
  GoPersonAdd,
  GoSearch,
} from "react-icons/go";
import { Input } from "@material-tailwind/react";
import axios from "axios";
import { baseUrl } from "../../utils/services";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const Restore = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "studentID",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerpage = 8;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false); // State to control checkbox visibility

  // Fetch students
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/auth/students/delete`);
        console.log(response.data);
        setStudents(response.data); // Assuming the response data is an array of students
      } catch (error) {
        console.error("Failed to fetch users", error);
        setStudents([]);
      }
    };
    fetchUsers();
  }, []);

  // Sorting function
  const sortedStudents = [...students]
    .filter((student) => {
      const studentIdMatch = student?.studentID
        ?.toString()
        .includes(searchQuery);
      const nameMatch = student?.user?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const emailMatch = student?.user?.email
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return studentIdMatch || nameMatch || emailMatch;
    })
    .sort((a, b) => {
      if (sortConfig.key === "studentID") {
        if (a.studentID < b.studentID)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a.studentID > b.studentID)
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
      let aValue = a.user?.[sortConfig.key] || "";
      let bValue = b.user?.[sortConfig.key] || "";
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(sortedStudents.length / rowsPerpage);
  const startIndex = (currentPage - 1) * rowsPerpage;
  const currentStudents = sortedStudents.slice(
    startIndex,
    startIndex + rowsPerpage
  );

  useEffect(() => {
    console.log("Updated students list:", students);
  }, [students]);

  // hard deleted
  const handleDelete = async (studentId) => {
    if (!studentId) {
      console.error("❌ studentId ไม่ถูกต้อง");
      return;
    }

    const result = await Swal.fire({
      title: "คุณต้องการลบข้อมูลนี้จริงหรือไม่?",
      text: "ข้อมูลจะถูกลบถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("❌ ไม่พบโทเค็น");
          return;
        }

        console.log("🔑 ส่งโทเค็นไปยัง API:", token);

        await axios.delete(`${baseUrl}/auth/students/delete/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📌 studentId ที่ถูกลบ:", studentId);

        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== studentId)
        );

        Swal.fire("สำเร็จ!", "ข้อมูลนักเรียนถูกลบเรียบร้อยแล้ว.", "success");
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการลบข้อมูล:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบข้อมูลนักเรียนได้", "error");
      }
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId) // เอาออกถ้ากดซ้ำ
        : [...prevSelected, studentId] // เพิ่มเข้าไปถ้าเลือก
    );
  };
  
  const handleDeleteMultiple = async () => {
    if (selectedStudents.length === 0) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกนักเรียนก่อนลบ", "warning");
      return;
    }
  
    const result = await Swal.fire({
      title: "คุณต้องการลบนักเรียนที่เลือกหรือไม่?",
      text: "ข้อมูลจะถูกลบถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
  
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ ไม่พบโทเค็น");
          return;
        }
  
        console.log("Token:", token); // Check if the token is being retrieved
  
        // ส่งคำขอ API สำหรับการลบหลายรายการ
        await axios.delete(`${baseUrl}/auth/students/delete-multiple`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { studentIds: selectedStudents }, // ส่งข้อมูล studentIds ที่ถูกเลือก
        });
  
        // อัปเดต UI
        setStudents((prev) =>
          prev.filter((student) => !selectedStudents.includes(student._id))
        );
  
        setSelectedStudents([]); // ล้างรายการที่เลือก
  
        Swal.fire("สำเร็จ!", "ลบนักเรียนที่เลือกเรียบร้อย", "success");
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการลบ:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบนักเรียนได้", "error");
      }
    }
  };
  
  //restore กู้คืน
  const handleRestore = async (studentId) => {
    const result = await Swal.fire({
      title: "คุณต้องการกู้คืนข้อมูลนี้จริงหรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "กู้คืน",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ ไม่พบโทเค็น");
          return;
        }

        await axios.put(
          `${baseUrl}/auth/students/restore`,
          { studentIds: [studentId] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // รีเฟรชข้อมูล
        setStudents((prev) =>
          prev.filter((student) => student._id !== studentId)
        );

        Swal.fire(
          "สำเร็จ!",
          "ข้อมูลนักเรียนถูกกู้คืนเรียบร้อยแล้ว.",
          "success"
        );
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการกู้คืนข้อมูล:", error);
        Swal.fire(
          "เกิดข้อผิดพลาด!",
          "ไม่สามารถกู้คืนข้อมูลนักเรียนได้",
          "error"
        );
      }
    }
  };

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
        <div className="w-52 md:w-72">
          <Input
            label="ค้นหา"
            icon={<GoSearch className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Toggle checkboxes visibility */}
        {/* <div className="flex justify-between items-center">
          <button
            onClick={() => setShowCheckboxes(!showCheckboxes)}
            className={`bg-red-600 text-white px-4 py-2 rounded ${
              selectedStudents.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-500"
            }`}
            disabled={selectedStudents.length === 0}
          >
            ลบหลายรายการ
          </button>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto m-0">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-600 text-white text-center">
              {/* {showCheckboxes && (
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedStudents(
                        e.target.checked ? students.map((s) => s._id) : []
                      )
                    }
                    checked={
                      selectedStudents.length > 0 &&
                      students.every((s) => selectedStudents.includes(s._id))
                    }
                  />
                </th>
              )} */}
              <th
                className="py-2 px-4"
              >
                ลำดับที่
              </th>
              <th
                className="py-2 px-4"
                onClick={() => requestSort("studentID")}
              >
                Student ID
              </th>
              <th
                className="py-2 px-4"
                onClick={() => requestSort("user.name")}
              >
                ชื่อ
              </th>
              <th
                className="py-2 px-4"
                onClick={() => requestSort("user.email")}
              >
                Email
              </th>
              <th className="py-2 px-4">กู้คืน</th>
              <th className="py-2 px-4">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 text-center text-xs md:text-sm"
                >
                  {showCheckboxes && (
                    <td className="py-2 px-4">
                      <input
                        type="checkbox"
                        onChange={() => handleSelectStudent(student._id)}
                        checked={selectedStudents.includes(student._id)}
                      />
                    </td>
                  )}
                  <td className="py-2 px-4 border">{startIndex + index + 1}</td>
                  <td className="py-2 px-4 border">
                    {student?.studentID || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    {student?.user?.name || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    {student?.user?.email || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleRestore(student._id)} // การกู้คืน
                      className="text-green-500 hover:text-green-700"
                    >
                      กู้คืน
                    </button>
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  ไม่พบนักศึกษาที่ถูกลบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-4 text-sm md:text-base">
        <button
          className={`px-4 py-2 border rounded-md ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        <span>
          หน้า {currentPage} / {totalPages}
        </span>
        <button
          className={`px-4 py-2 border rounded-md ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Restore;
