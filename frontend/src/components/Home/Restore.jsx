import React, { useEffect, useState } from "react";
import { GoSearch, GoSync, GoTrash } from "react-icons/go";
import { Input } from "@material-tailwind/react";
import axios from "axios";
import { baseUrl } from "../../utils/services";
import Swal from "sweetalert2";

const Restore = () => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "deletedAt",
    direction: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerpage = 10;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // Fetch students
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/auth/users/softDelete`);
        console.log(response.data);
        setUsers(response.data); // Assuming the response data is an array of students
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // // Sorting function
  // const sortedStudents = [...students]
  //   // .filter((student) => student.user !== null)
  //   .filter((student) => {
  //     const studentIdMatch = student?.studentID
  //       ?.toString()
  //       .includes(searchQuery);
  //     const nameMatch = student?.user?.name
  //       ?.toLowerCase()
  //       .includes(searchQuery.toLowerCase());
  //     const emailMatch = student?.user?.email
  //       ?.toLowerCase()
  //       .includes(searchQuery.toLowerCase());
  //     return studentIdMatch || nameMatch || emailMatch;
  //   })
  //   .sort((a, b) => {
  //     if (sortConfig.key === "studentID") {
  //       if (a.studentID < b.studentID)
  //         return sortConfig.direction === "asc" ? -1 : 1;
  //       if (a.studentID > b.studentID)
  //         return sortConfig.direction === "asc" ? 1 : -1;
  //       return 0;
  //     }
  //     let aValue = a.user?.[sortConfig.key] || "";
  //     let bValue = b.user?.[sortConfig.key] || "";
  //     if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
  //     if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
  //     return 0;
  //   });

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter((u) => {
    const name = u?.user?.name?.toLowerCase() || "";
    const email = u?.user?.email?.toLowerCase() || "";
    const studentID = u.studentID?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return (
      name.includes(query) || email.includes(query) || studentID.includes(query)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "deletedAt") {
      aValue = new Date(a.deletedAt || 0);
      bValue = new Date(b.deletedAt || 0);
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(sortedUsers.length / rowsPerpage);
  const startIndex = (currentPage - 1) * rowsPerpage;
  const currentStudents = sortedUsers.slice(
    startIndex,
    startIndex + rowsPerpage
  );

  // useEffect(() => {
  //   console.log("Updated students list:", students);
  // }, [students]);

  // hard deleted

  const handleDelete = async (id, role) => {
    const endpoint = role === "teacher" ? "teachers" : "students";

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

        await axios.delete(`${baseUrl}/auth/${endpoint}/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setUsers((prev) => prev.filter((u) => u._id !== id));

        // setStudents((prevStudents) =>
        //   prevStudents.filter((student) => student._id !== studentId)
        // );

        Swal.fire("สำเร็จ!", "ลบเรียบร้อยแล้ว.", "success");
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการลบข้อมูล:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบได้", "error");
      }
    }
  };

  // const handleSelectStudent = (studentId) => {
  //   setSelectedStudents(
  //     (prevSelected) =>
  //       prevSelected.includes(studentId)
  //         ? prevSelected.filter((id) => id !== studentId) // เอาออกถ้ากดซ้ำ
  //         : [...prevSelected, studentId] // เพิ่มเข้าไปถ้าเลือก
  //   );
  // };

  // const handleDeleteMultiple = async () => {
  //   if (selectedStudents.length === 0) {
  //     Swal.fire("แจ้งเตือน", "กรุณาเลือกนักเรียนก่อนลบ", "warning");
  //     return;
  //   }

  //   const result = await Swal.fire({
  //     title: "คุณต้องการลบนักเรียนที่เลือกหรือไม่?",
  //     text: "ข้อมูลจะถูกลบถาวร!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "ลบ",
  //     cancelButtonText: "ยกเลิก",
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         console.error("❌ ไม่พบโทเค็น");
  //         return;
  //       }

  //       console.log("Token:", token); // Check if the token is being retrieved

  //       // ส่งคำขอ API สำหรับการลบหลายรายการ
  //       await axios.delete(`${baseUrl}/auth/students/delete-multiple`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         data: { studentIds: selectedStudents }, // ส่งข้อมูล studentIds ที่ถูกเลือก
  //       });

  //       // อัปเดต UI
  //       setStudents((prev) =>
  //         prev.filter((student) => !selectedStudents.includes(student._id))
  //       );

  //       setSelectedStudents([]); // ล้างรายการที่เลือก

  //       Swal.fire("สำเร็จ!", "ลบนักเรียนที่เลือกเรียบร้อย", "success");
  //     } catch (error) {
  //       console.error("❌ เกิดข้อผิดพลาดในการลบ:", error);
  //       Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบนักเรียนได้", "error");
  //     }
  //   }
  // };

  //restore กู้คืน

  const handleRestore = async (id, role) => {
    const endpoint = role === "teacher" ? "teacher" : "student";
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
          `${baseUrl}/auth/${endpoint}s/restore`,
          { [`${endpoint}Ids`]: [id] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // รีเฟรชข้อมูล
        setUsers((prev) => prev.filter((u) => u._id !== id));

        Swal.fire("สำเร็จ!", "กู้คืนเรียบร้อยแล้ว.", "success");
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

  // const handleRestoreMultiple = async () => {
  //   if (selectedStudents.length === 0) {
  //     Swal.fire("แจ้งเตือน", "กรุณาเลือกนักเรียนก่อนกู้คืน", "warning");
  //     return;
  //   }

  //   const result = await Swal.fire({
  //     title: "คุณต้องการกู้คืนทั้งหมดจริงหรือไม่?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonText: "กู้คืน",
  //     cancelButtonText: "ยกเลิก",
  //   });

  //   if (!result.isConfirmed) return;

  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       console.error("❌ ไม่พบโทเค็น");
  //       Swal.fire(
  //         "เกิดข้อผิดพลาด",
  //         "ไม่พบโทเค็น กรุณาเข้าสู่ระบบใหม่",
  //         "error"
  //       );
  //       return;
  //     }

  //     console.log(
  //       "📦 Payload ที่จะส่ง:",
  //       JSON.stringify({ studentIds: selectedStudents }, null, 2)
  //     );

  //     await axios.put(
  //       `${baseUrl}/auth/students/restoreMultiple`,
  //       { studentIds: selectedStudents },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     setStudents((prevStudents) =>
  //       prevStudents.filter(
  //         (student) => !selectedStudents.includes(student._id)
  //       )
  //     );

  //     setSelectedStudents([]);

  //     Swal.fire("สำเร็จ!", "กู้คืนรายการสำเร็จ", "success");
  //   } catch (error) {
  //     console.error("❌ Error restoring:", error);
  //     Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถกู้คืนหลายรายการได้", "error");
  //   }
  // };

  const handleRestoreMultiple = async () => {
    const token = localStorage.getItem("token");
    const grouped = {
      students: [],
      teachers: [],
    };

    users.forEach((u) => {
      if (selectedUsers.includes(u._id)) {
        if (u.user?.role === "teacher") grouped.teachers.push(u._id);
        else grouped.students.push(u._id);
      }
    });

    try {
      if (grouped.students.length > 0) {
        await axios.put(
          `${baseUrl}/auth/students/restoreMultiple`,
          { studentIds: grouped.students },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      if (grouped.teachers.length > 0) {
        await axios.put(
          `${baseUrl}/auth/teachers/restoreMultiple`,
          { teacherIds: grouped.teachers },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
      Swal.fire("สำเร็จ", "กู้คืนเรียบร้อย", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถกู้คืนได้", "error");
    }
  };

  const handleDeleteMultiple = async () => {
    const token = localStorage.getItem("token");
    const grouped = {
      students: [],
      teachers: [],
    };

    users.forEach((u) => {
      if (selectedUsers.includes(u._id)) {
        if (u.user?.role === "teacher") grouped.teachers.push(u._id);
        else grouped.students.push(u._id);
      }
    });

    try {
      if (grouped.students.length > 0) {
        await axios.delete(`${baseUrl}/auth/students/delete-multiple`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { studentIds: grouped.students },
        });
      }

      if (grouped.teachers.length > 0) {
        await axios.delete(`${baseUrl}/auth/teachers/delete-multiple`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { teacherIds: grouped.teachers },
        });
      }

      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
      Swal.fire("สำเร็จ", "ลบถาวรเรียบร้อย", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบได้", "error");
    }
  };

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredUsers.length / rowsPerpage);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(newTotalPages, 1));
    }
  }, [filteredUsers.length]);

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
                    const allIds = filteredUsers.map((u) => u._id);
                    setSelectedUsers(e.target.checked ? allIds : []);
                  }}
                  checked={
                    filteredUsers.length > 0 &&
                    filteredUsers.every((u) => selectedUsers.includes(u._id))
                  }
                />
              </th>

              <th className="py-2 px-2">ลำดับที่</th>
              <th className="py-2 px-4">Student ID</th>
              <th className="py-2 px-4">ชื่อ</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">สถานะ</th>
              <th
                className="py-2 px-2 cursor-pointer hover:underline"
                onClick={() => requestSort("deletedAt")}
              >
                วันที่ลบ{" "}
                {sortConfig.key === "deletedAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th className="py-2 px-2">กู้คืน</th>
              <th className="py-2 px-2">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((u, index) => {
                const isSelected = selectedUsers.includes(u._id);
                return (
                  <tr
                    key={u._id}
                    className={`text-center text-xs md:text-sm ${
                      isSelected ? "bg-blue-50" : "odd:bg-white even:bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-2 px-4 border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelect(u._id)}
                      />
                    </td>

                    <td className="py-2 px-2 border">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-2 px-4 border">
                      {u.studentID ? u.studentID : "-"}
                    </td>
                    <td className="py-2 px-4 border">
                      {u.user?.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border">
                      {u.user?.email || "N/A"}
                    </td>
                    <td className="py-2 px-4 border">
                      <span
                        className={
                          u.user?.role === "teacher"
                            ? "text-blue-700"
                            : "text-green-700"
                        }
                      >
                        {u.user?.role === "teacher" ? "อาจารย์" : "นักศึกษา"}
                      </span>
                    </td>
                    <td className="py-2 px-2 border">
                      {u.deletedAt
                        ? new Date(u.deletedAt).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-2 px-2 border">
                      <button
                        onClick={() =>
                          handleRestore(
                            u._id,
                            u.user?.role
                          )
                        } // การกู้คืน
                        className="text-green-500 hover:text-green-700"
                      >
                        <GoSync/>
                      </button>
                    </td>
                    <td className="py-2 px-2 border">
                      <button
                        onClick={() => handleDelete(u._id, u.user?.role)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <GoTrash/>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="py-4 text-center text-gray-500">
                  ไม่พบรายชื่อนักศึกษา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Seft Delete */}
      <div className="mt-4 flex flex-wrap justify-end items-center gap-2 mb-2 ">
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-600">
              เลือกแล้ว
              <span className="text-red-600">
                {selectedUsers.length}
              </span> / {users.length} รายการ
            </span>

            <button
              onClick={async () => {
                setIsProcessing(true);
                await handleRestoreMultiple();
                setIsProcessing(false);
              }}
              className="bg-green-600 text-white px-4 py-2 flex items-center rounded hover:bg-green-500"
            >
              <GoSync className="text-white w-5 h-5 mr-2" />
              กู้คืน
            </button>
            <button
              onClick={async () => {
                setIsProcessing(true);
                await handleDeleteMultiple();
                setIsProcessing(false);
              }}
              className="bg-red-600 text-white px-4 py-2 flex items-center rounded hover:bg-red-500"
            >
              <GoTrash className="text-white w-5 h-5 mr-2" />
              ลบถาวร
            </button>
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

export default Restore;
