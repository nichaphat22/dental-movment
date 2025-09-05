import React, { useEffect, useState } from "react";
import quizService from "../../../utils/quizService";
import { useNavigate, useLocation } from "react-router-dom";
// import defaultImage from "../../../../public/imgQuiz.svg";
import { CiEdit, CiTrash } from "react-icons/ci";
import Swal from "sweetalert2";
import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Progress, Typography } from "@material-tailwind/react";
import { HiOutlineClipboard } from "react-icons/hi";
import { PiClipboardTextDuotone } from "react-icons/pi";
import { Spinner } from "react-bootstrap";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.success) {
      // toast.success(location.state.message || 'Quiz created successfully!', {
      //   position: "top-right",
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: false,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      //   theme: "light",
      //   transition: Flip,
      // });
    }
  }, [location.state]); // เพิ่ม dependency array เพื่อให้ run เมื่อ state เปลี่ยนแปลงเท่านั้น

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizClick = (id) => {
    navigate(`/quiz-teacher/${id}`);
    console.log(id);
  };

  const handleEditQuiz = (id) => {
    navigate(`/quiz-teacher/${id}/edit`);
    console.log(id);
  };

  const handleDeleteQuiz = (id) => {
    console.log("Deleting Quiz ID:", id); // ตรวจสอบว่า id ถูกต้อง

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
            Swal.fire(
              "เกิดข้อผิดพลาด",
              "ไม่สามารถติดต่อกับเซิร์ฟเวอร์",
              "error"
            );
          } else {
            console.error("ข้อผิดพลาดอื่น ๆ:", error.message);
            Swal.fire("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดไม่ทราบสาเหตุ", "error");
          }
        }
      }
    });
  };

  return (
    <div className="relative grid grid-cols-1 gap-6 mt-4 sm:m-4 md:m-10 lg:m-20 cursor-pointer">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
                <div className="flex items-center space-x-3">
                  <Spinner
                    animation="grow"
                    role="status"
                    style={{
                      width: "25px",
                      height: "25px",
                      marginRight: "8px",
                      backgroundColor: "#a845f3",
                    }}
                  />
                  <span className="text-gray-500 text-lg font-normal">กำลังโหลด...</span>
                </div>
              </div>
      ) : quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="relative p-2 md:p-4 bg-white md:hover:border-b-4 md:hover:border-purple-500 inset-shadow-xs rounded-md drop-shadow-xl transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-x-105"
          >
            <div className="mb-2">
              {/* ปุ่มแก้ไขและลบ */}
              <CiTrash
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuiz(quiz._id);
                }}
                className="absolute top-4 right-4 text-sm md:text-xl cursor-pointer text-gray-500 hover:text-red-500"
              />
              <CiEdit
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditQuiz(quiz._id);
                }}
                className="absolute top-4 right-9 md:right-10 sm md:text-xl cursor-pointer text-gray-500 hover:text-blue-500"
              />
            </div>

            {/* คอนเทนต์หลัก */}
            <div className="flex" onClick={() => handleQuizClick(quiz._id)}>
              <div className=" flex flex-col justify-between w-full min-w-0 px-2 lg:px-4">
                <div>
                  {/* ชื่อแบบทดสอบ */}
                  <div className="flex items-center m-2 space-x-2 md:space-x-6 ">
                    <PiClipboardTextDuotone className="text-xl md:text-3xl  lg:text-4xl text-purple-600 mt-2 flex-shrink-0" />
                    <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-700 cursor-pointer break-words whitespace-normal overflow-hidden text-ellipsis line-clamp-2 min-w-0">
                      {quiz.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 lg:pl-2 ml-9 mb:ml-14 lg:ml-16 md:mt-2 mb-2 break-words whitespace-normal overflow-hidden text-ellipsis min-w-0">
                    จำนวนข้อ: {quiz.questions?.length || 0}
                  </p>
                  {/* <p>
                  ผู้สร้าง: {quiz.teacher?.user?.name || 'No teacher assigned'}
                  </p> */}
                </div>

                {/* วันที่สร้าง */}
                <div className="mt-2 md:mt-4 text-xs md:text-sm mb-2 text-gray-600 text-end">
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
        <p className="text-center flex justify-center mt-2">ไม่มีแบบทดสอบ</p>
      )}
    </div>
  );
};

export default QuizList;
