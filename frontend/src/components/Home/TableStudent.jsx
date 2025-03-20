import React, { useEffect, useState } from "react";
import {
  GoChevronDown,
  GoChevronUp,
  GoPencil,
  GoPersonAdd,
  GoSearch,
} from "react-icons/go";
import { Input } from "@material-tailwind/react";
import EditStudentModel from "./EditStudentModel";
import AddUser from "./AddUser";
import axios from "axios";
import { baseUrl } from "../../utils/services";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const TableStudent = () => {
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

  // Fetch students
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/auth/students`);
        console.log(response.data);
        setStudents(response.data); // Assuming the response data is an array of students
      } catch (error) {
        console.error("Failed to fetch users", error);
        setStudents([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAddModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAddModalOpen]);

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEditModalOpen]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
};

const handleSave = (updatedStudent) => {
    setStudents((prevStudents) =>
        prevStudents.map((student) =>
            student._id === updatedStudent._id ? updatedStudent : student
        )
    );
};


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

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(
      (prevSelected) =>
        prevSelected.includes(studentId)
          ? prevSelected.filter((id) => id !== studentId) // เอาออกถ้ากดซ้ำ
          : [...prevSelected, studentId] // เพิ่มเข้าไปถ้าเลือก
    );
  };

  // soft deleted
  const handleSoftDelete = async (studentId) => {
    try {
      const token = localStorage.getItem("token"); // หรือดึงจาก Redux ถ้ามี
      if (!token) {
        console.error("Token not found. User might not be authenticated.");
        return;
      }
      await axios.put(
        `${baseUrl}/auth/students/softDelete/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // ส่ง token ไปใน request
          },
        }
      );
      // Remove deleted student from the UI
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student._id !== studentId)
      );
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Soft delete multiple students
  const handleSoftDeleteMultiple = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Token not found.");
      Swal.fire("เกิดข้อผิดพลาด", "ไม่พบโทเค็น กรุณาเข้าสู่ระบบใหม่", "error");
      return;
    }

    try {
      // ตรวจสอบข้อมูลที่ส่งไปก่อน
      console.log("Deleting students with IDs: ", selectedStudents);

      const response = await axios.put(
        `${baseUrl}/auth/students/softDelete/delete-multiple`,
        { studentIds: selectedStudents }, // ส่ง array ของ studentIds
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update UI
      setStudents((prevStudents) =>
        prevStudents.filter(
          (student) => !selectedStudents.includes(student._id)
        )
      );
      setSelectedStudents([]); // Clear selection
      Swal.fire("สำเร็จ!", "ลบหลายรายการสำเร็จ", "success");
    } catch (error) {
      console.error("❌ Error deleting:", error);
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบหลายรายการได้", "error");
    }
  };

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div>
          <button
            onClick={handleAddUser}
            className="bg-purple-600 text-white md:text-base px-4 py-2 rounded flex items-center hover:bg-purple-500 transition"
          >
            <GoPersonAdd className="w-5 h-5 mr-2" />
            เพิ่มรายชื่อนักศึกษา
          </button>

          {isAddModalOpen && (
            <AddUser
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
            />
          )}
        </div>

        <div className="w-52 md:w-72">
          <Input
            label="ค้นหา"
            icon={<GoSearch className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
      </div>
       {/* Soft Delete */}
       {/* <div className="mt-4 flex justify-end gap-2 mb-2">
        <button
          onClick={handleSoftDeleteMultiple}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500"
        >
          ลบหลายรายการ
        </button>
      </div> */}

      {/* Table */}
      <div className="overflow-x-auto m-0">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-600 text-white text-center">
              {/* <th>
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
              </th> */}
              <th className="py-2 px-4">ลำดับที่</th>
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
              {/* <th className="py-2 px-4">แก้ไข</th> */}
              <th className="py-2 px-4">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 text-center text-xs md:text-sm">
                  {/* <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleSelectStudent(student._id)}
                    />
                  </td> */}
                  <td className="py-2 px-4 border">{startIndex + index + 1}</td>
                  <td className="py-2 px-4 border">{student?.studentID || "N/A"}</td>
                  <td className="py-2 px-4 border">{student?.user?.name || "N/A"}</td>
                  <td className="py-2 px-4 border">{student?.user?.email || "N/A"}</td>
                  {/* แก้ไข */}
                  {/* <td className="py-2 px-4">
                    <button
                      onClick={() => handleEdit(student._id)}
                      className="bg-yellow-500 text-white rounded px-2 py-1 hover:bg-yellow-400"
                    >
                      <GoPencil />
                    </button>
                    {isEditModalOpen && selectedStudent && (
                      <EditStudentModel
                        isOpen={isEditModalOpen}
                        student={selectedStudent}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={handleSave}
                      />
                    )}
                  </td> */}
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleSoftDelete(student._id)}
                      className="bg-red-600 text-white rounded px-2 py-1 hover:bg-red-500"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  ไม่มีข้อมูลนักเรียน
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

export default TableStudent;
