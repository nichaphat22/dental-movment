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

const TableStudent = () => {
  // const user = useSelector(state => state.auth.user);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerpage = 5;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  //get student
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users`);
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  console.log(users);

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

  //addUser
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

  //edit
  const handleEdit = (user) => {
    setSelectedStudent(user);
    setIsEditModalOpen(true);
  };

  //save edit
  const handleSave = (updatedStudent) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.email === updatedStudent.email ? updatedStudent : student
      )
    );
  };

  // ฟังก์ชัน Sort ข้อมูล
  // const sortedStudents = [...students]
  const sortedUsers = [...users]
    .filter(
      (users) =>
        (users?.name &&
          users?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (users?.email &&
          users?.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  //ฟังก์ชันเปลี่ยนการเรียงลำดับ
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // แสดงข้อมูลตามหน้า
  const totalPages = Math.ceil(sortedUsers.length / rowsPerpage);
  const startIndex = (currentPage - 1) * rowsPerpage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + rowsPerpage);

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div>
          <button
            onClick={() => handleAddUser()}
            className="bg-purple-600 text-white md:text-base px-4 py-2 rounded flex items-center hover:bg-purple-500 transition"
          >
            <GoPersonAdd className="w-5 h-5 mr-2" />
            เพิ่มรายชื่อนักศึกษา
          </button>

          {isAddModalOpen && (
            <AddUser
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              // student={selectedStudent}
              // onSave={handleSave}
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
            <tr className="bg-gray-600 text-white text-center ">
              <th className="py-2 px-4">ชื่อ</th>
              <th className="py-2 px-4">email</th>
              {/* <th
                className="py-2 cursor-pointer text-left min-w-[100px]"
                onClick={() => requestSort("sec")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>sec</span>
                  {sortConfig.key === "sec" ? (
                    sortConfig.direction === "asc" ? (
                      <GoChevronUp />
                    ) : (
                      <GoChevronDown />
                    )
                  ) : (
                    <GoChevronDown className="text-gray-400" />
                  )}
                </div>
              </th> */}

              {/* <th
                className="py-2 px-4 cursor-pointer text-left min-w-[100px]"
                onClick={() => requestSort("year")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>ปีการศึกษา</span>
                  {sortConfig.key === "year" ? (
                    sortConfig.direction === "asc" ? (
                      <GoChevronUp />
                    ) : (
                      <GoChevronDown />
                    )
                  ) : (
                    <GoChevronDown className="text-gray-400" />
                  )}
                </div>
              </th> */}

              <th
                className="py-2 px-4 cursor-pointer text-left min-w-[100px]"
                onClick={() => requestSort("role")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>role</span>
                  {sortConfig.key === "role" ? (
                    sortConfig.direction === "asc" ? (
                      <GoChevronUp />
                    ) : (
                      <GoChevronDown />
                    )
                  ) : (
                    <GoChevronDown className="text-gray-400" />
                  )}
                </div>
              </th>
              <th className="py-2 px-4">แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 text-center text-xs md:text-sm"
                >
                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  {/* <td className="py-2 px-2 border">{users?.sec}</td> */}
                  {/* <td className="py-2 px-4 border">{users?.year}</td> */}
                  <td className="py-2 px-4 border">{user.role}</td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <GoPencil size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  ไม่พบนักศึกษาที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isEditModalOpen && (
        <EditStudentModel
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={selectedStudent}
          onSave={handleSave}
        />
      )}

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
