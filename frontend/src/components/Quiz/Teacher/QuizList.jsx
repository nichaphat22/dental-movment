import React, { useEffect, useState } from "react";
import quizService from "../../../utils/quizService";
import { useNavigate, useLocation } from "react-router-dom";
import defaultImage from "../../../../public/imgQuiz.svg";
import { CiEdit, CiTrash } from "react-icons/ci";
import Swal from "sweetalert2";
import { toast,Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.success) {
      toast.success(location.state.message || 'Quiz created successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
      });
    }
  }, [location.state]); // เพิ่ม dependency array เพื่อให้ run เมื่อ state เปลี่ยนแปลงเท่านั้น
  
   

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizService.getAllQuiz();

        if (response.data && Array.isArray(response.data.quiz)) {
          setQuizzes(response.data.quiz);
        } else {
          console.error("Expected an array but got", response.data);
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes", error);
        setQuizzes([]);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizClick = (id) => {
    navigate(`/quiz/${id}`);
    console.log(id);
  };

  const handleEditQuiz = (id) => {
    navigate(`/quiz/${id}/edit`);
    console.log(id);
  };

  const handleDeleteQuiz = (id) => {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await quizService.deleteQuiz(id);
          Swal.fire("ลบสำเร็จ!", "แบบทดสอบได้ถูกลบเรียบร้อยแล้ว", "success");
          setQuizzes((prev) => prev.filter((quiz) => quiz._id !== id));
        } catch (error) {
          if (error.response) {
            console.error("เกิดข้อผิดพลาดในการลบควิซ:", error.response.data);
            Swal.fire("เกิดข้อผิดพลาด", error.response.data.message, "error");
          } else if (error.request) {
            console.error("ไม่สามารถติดต่อกับเซิร์ฟเวอร์:", error.request);
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถติดต่อกับเซิร์ฟเวอร์", "error");
          } else {
            console.error("ข้อผิดพลาดอื่น ๆ:", error.message);
            Swal.fire("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดไม่ทราบสาเหตุ", "error");
          }
        }
      }
    });
  };

  return (
    <div className="relative grid grid-cols-1 gap-6 mt-4 m-10 lg:m-48">
      <ToastContainer  />             
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="relative p-4 mb-4 bg-white border rounded-xl shadow-sm hover:bg-gray-100 cursor-pointer"
          >
            {/* ปุ่มแก้ไขและลบ */}
            <CiTrash
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteQuiz(quiz._id);
              }}
              className="absolute top-4 right-4 text-xl cursor-pointer text-gray-500 hover:text-red-500"
            />
            <CiEdit
              onClick={(e) => {
                e.stopPropagation();
                handleEditQuiz(quiz._id);
              }}
              className="absolute top-4 right-10 text-xl cursor-pointer text-gray-500 hover:text-blue-500"
            />

            {/* คอนเทนต์หลัก */}
            <div className="flex" onClick={() => handleQuizClick(quiz._id)}>
              {quiz.image ? (
                <img
                  src={quiz.image}
                  alt={quiz.title}
                  className="w-40 h-40 rounded-md"
                />
              ) : (
                <img
                  src={defaultImage}
                  alt="Quiz"
                  className="w-40 h-40 object-cover rounded-md shadow-none"
                />
              )}

              <div className="ml-8 flex flex-col justify-between w-full mt-4">
                <div>
                  {/* ชื่อแบบทดสอบ */}
                  <h3 className="text-lg font-medium text-indigo-500 cursor-pointer">
                    {quiz.title}
                  </h3>

                  <p className="text-sm text-gray-600">
                    จำนวนข้อ: {quiz.questions?.length || 0}
                  </p>
                </div>

                {/* วันที่สร้าง */}
                <div className="mt-4 text-sm text-gray-600 text-end">
                  วันที่สร้าง:{" "}
                  {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center flex justify-center mt-2">ไม่มีแบบทดสอบให้แสดง</p>
      )}
    </div>
  );
};

export default QuizList;
