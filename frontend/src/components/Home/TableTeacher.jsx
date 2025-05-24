import React, { useEffect, useState } from "react";
import { GoSearch, GoPersonAdd, GoTrash } from "react-icons/go";
import { Input } from "@material-tailwind/react";
import AddTeacher from "./AddTeacher";
import axios from "axios";
import { baseUrl } from "../../utils/services";
import Swal from "sweetalert2";

const TableTeacher = () => {
  const [teacher, setTeacher] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerpage = 8;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  //Fetch teacher
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/auth/teachers`);
      console.log(response.data);
      setTeacher(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      setTeacher([]);
    }
  };

  useEffect(() => {
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

  const handleAddTeacher = () => {
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

  // Sorting function
  const filteredTeacher = teacher.filter((t) => {
    const name = t.user?.name?.toLowerCase() || "";
    const email = t.user?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const totalPages = Math.ceil(filteredTeacher.length / rowsPerpage);
  const startIndex = (currentPage - 1) * rowsPerpage;
  const currentTeacher = filteredTeacher.slice(
    startIndex,
    startIndex + rowsPerpage
  );

  //softDelete
  const handleSoftDelete = async (teacherId) => {
    if (!teacherId) {
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
          `${baseUrl}/auth/teachers/softDelete/${teacherId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // ส่ง token ไปใน request
            },
          }
        );
        // Remove deleted student from the UI
        setTeacher((prevTeachers) =>
          prevTeachers.filter((teacher) => teacher._id !== teacherId)
        );

        Swal.fire("สำเร็จ!", "ข้อมูลอาจารย์ถูกลบเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบข้อมูลอาจารย์ได้", "error");
      }
    }
  };
  useEffect(() => {
    const newTotalPages = Math.ceil(teacher.length / rowsPerpage);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(newTotalPages, 1));
    }
  }, [teacher.length]);

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div>
          <button
            onClick={handleAddTeacher}
            className="bg-purple-600 text-white md:text-base px-4 py-2 rounded flex items-center hover:bg-purple-500 transition"
          >
            <GoPersonAdd className="w-5 h-5 mr-2" />
            เพิ่มรายชื่อ
          </button>
          {isAddModalOpen && (
            <AddTeacher
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
              <th className="py-2 px-2">ลำดับที่</th>
              <th className="py-2 px-4">ชื่อ</th>
              <th className="py-2 px-4">Email</th>
              {/* <th className="py-2 px-2">สถานะ</th> */}
              {/* <th className="py-2 px-2">วันที่เข้าใช้งาน</th> */}
              <th className="py-2 px-2">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {currentTeacher.length > 0 ? (
              currentTeacher.map((teacher, index) => (
                <tr
                  key={teacher._id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 text-center text-xs md:text-sm"
                >
                  <td className="py-2 px-4 border">{startIndex + index + 1}</td>
                  <td className="py-2 px-4 border">
                    {teacher?.user?.name || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    {teacher?.user?.email || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">
                    <button onClick={() => handleSoftDelete(teacher._id)}>
                      <GoTrash className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
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
            currentPage >= totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-200"
          } `}
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

export default TableTeacher;
