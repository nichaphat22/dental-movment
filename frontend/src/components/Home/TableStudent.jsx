import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
import {
  GoChevronDown,
  GoChevronUp,
  GoPencil,
  GoPersonAdd,
  GoSearch,
  GoTrash,
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

  const rowsPerpage = 10;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

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
  // Fetch students
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("studentAdded", (newStudent) => {
      setStudents((prev) => [...prev, newStudent]);
    });

    socket.on("studentDeleted", (deletedId) => {
      setStudents((prev) => prev.filter((s) => s._id !== deletedId));
    });

    return () => {
      socket.off("studentAdded");
      socket.off("studentDeleted");
    };
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

  useEffect(() => {
    const newTotalPages = Math.ceil(sortedStudents.length / rowsPerpage);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(newTotalPages, 1));
    }
  }, [students, sortedStudents.length]);

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
    if (!studentId) {
      console.error("❌ studentId ไม่ถูกต้อง");
      return;
    }

    const result = await Swal.fire({
      title: "คุณต้องการลบข้อมูลนี้จริงหรือไม่?",
      text: "ข้อมูลจะถูกลบ!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
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

        

        Swal.fire("สำเร็จ!", "ข้อมูลนักศึกษาถูกลบเรียบร้อยแล้ว.", "success");
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบข้อมูลนักศึกษาได้", "error");
      }
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
      console.log(
        "📦 Payload ที่จะส่ง:",
        JSON.stringify({ studentIds: selectedStudents }, null, 2)
      );

      console.log("Deleting students with IDs: ", selectedStudents);

      const res = await axios.put(
        `${baseUrl}/auth/students/softDelete/delete-multiple`,
        { studentIds: selectedStudents }, // ส่ง array ของ studentIds
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(selectedStudents);

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
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบนักศึกษาได้", "error");
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
              onSuccess={fetchUsers}
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

      {/* Table */}
      <div className="overflow-x-auto m-0">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-600 text-white text-center">
              <th className="py-2 px-2">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const idsToAdd = currentStudents
                        .map((s) => s._id)
                        .filter((id) => !selectedStudents.includes(id));
                      setSelectedStudents([...selectedStudents, ...idsToAdd]);
                    } else {
                      const idsToRemove = currentStudents.map((s) => s._id);
                      setSelectedStudents(
                        selectedStudents.filter(
                          (id) => !idsToRemove.includes(id)
                        )
                      );
                    }
                  }}
                  checked={currentStudents.every((s) =>
                    selectedStudents.includes(s._id)
                  )}
                />
              </th>

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
              currentStudents.map((student, index) => {
                const isSelected = selectedStudents.includes(student._id);
                return (
                  <tr
                    key={index}
                    className={`text-center text-xs md:text-sm ${
                      isSelected ? "bg-blue-50" : "odd:bg-white even:bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-2 px-2 border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectStudent(student._id)}
                      />
                    </td>

                    <td className="py-2 px-2 border">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-2 px-4 border">
                      {student?.studentID || "N/A"}
                    </td>
                    <td className="py-2 px-4 border">
                      {student?.user?.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border">
                      {student?.user?.email || "N/A"}
                    </td>
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
                        // className="bg-red-600 text-white rounded px-2 py-1 hover:bg-red-500"
                      >
                        <GoTrash className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
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

      {/* Soft Delete */}
      <div className="mt-4 flex flex-wrap justify-end items-center gap-2 mb-2">
        {/* <div>
          <button
            onClick={() => setSelectMode(!selectMode)}
            className={`px-4 py-2 rounded ${selectMode ? "bg-gray-500" : "bg-blue-600"} text-white hover:opacity-90`}
          >
            {selectMode ? "ยกเลิก Select" : "Select"}
          </button>
        </div> */}
        {selectedStudents.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-600">
              เลือกแล้ว{" "}
              <span className="text-red-600">{selectedStudents.length}</span> /{" "}
              {students.length} รายการ
            </span>
            {/* <span>
              ในหน้านี้: {currentStudents.filter(s => selectedStudents.includes(s._id)).length} / {currentStudents.length}
            </span> */}

            {selectedStudents.length > 0 && (
              <button
                onClick={handleSoftDeleteMultiple}
                className="bg-red-600 text-white px-4 py-2 flex items-center rounded hover:bg-red-500"
              >
                <GoTrash className="text-white w-5 h-5 mr-2" />
                ลบ
              </button>
            )}
          </div>
        )}
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
            currentPage >= totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage >= totalPages}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default TableStudent;
