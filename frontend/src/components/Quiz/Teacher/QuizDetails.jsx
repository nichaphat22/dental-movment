import React, { useEffect, useState } from "react";
import quizService from "../../../utils/quizService";
import { useNavigate, useParams } from "react-router-dom";
import { CiMenuKebab, CiEdit, CiTrash } from "react-icons/ci";
import Swal from "sweetalert2";
import { Spinner } from "react-bootstrap";

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(id);
        setQuiz(response.data.quiz);
        console.log("Quiz data:", response.data.quiz); // ตรวจสอบข้อมูลที่ได้รับ
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleEditQuiz = (id) => {
    navigate(`/quiz-teacher/${id}/edit`);
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
          navigate("/ListQuiz-teacher"); // กลับไปที่หน้ารายชื่อควิซ
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

  if (loading) {
    return (
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
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return <div>ไม่มีคำถามในแบบทดสอบนี้</div>; // กรณีไม่มีคำถาม
  }

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      {/* <CiEdit className="absolute top-4 right-10 text-xl cursor-pointer text-gray-500"/> */}
      <CiTrash
        onClick={() => handleDeleteQuiz(quiz._id)}
        className="absolute top-4 right-4 text-sm md:text-xl cursor-pointer text-gray-500"
      />
      <CiEdit
        onClick={() => handleEditQuiz(quiz._id)}
        className="absolute top-4 right-10 text-sm md:text-xl cursor-pointer text-gray-500"
      />

      <h1 className="text-lg md:text-2xl font-bold text-gray-800 mt-2">
        {quiz.title || "ไม่มีชื่อแบบทดสอบ"}
      </h1>
      {/* จำนวนคำถาม */}
      <p className="text-xs md:text-sm text-gray-600  mb-2">
        จำนวนข้อ: {quiz.questions?.length || 0}
      </p>
      <p className="text-xs md:text-sm text-gray-600 mb-6">
        คำอธิบาย: {quiz.description || "ไม่มีคำอธิบาย"}
      </p>

      <p className="mt-2 text-xs md:text-sm text-gray-600 text-end">
        วันที่สร้าง:{" "}
        {new Date(quiz.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>

      <h2 className="text-sm md:text-base lg:text-xl font-semibold text-gray-700 mb-2">
        คำถาม
      </h2>

      {quiz.questions && quiz.questions.length > 0 ? (
        quiz.questions.map((question, index) => (
          <div
            key={index}
            className="mb-6 p-4 border rounded-md bg-gray-50 shadow-sm"
          >
            <p className="flex text-sm md:text-base font-medium text-gray-800 mb-2 ">
              {index + 1}. {"  "}
              <span className="font-medium text-justify ">
                {question.question || "ไม่มีคำถาม"}
              </span>
            </p>
            <div className="relative flex items-center justify-center text-center mb-2">
              {question.image && (
                <img
                  src={question.image}
                  alt={`Question ${index + 1}`}
                  className="max-w-60 h-auto rounded-lg border hover:transform-none shadow-none"
                />
              )}
            </div>
            <ol className="list-decimal text-xs md:text-base pl-6 text-gray-700">
              {question.choices && question.choices.length > 0 ? (
                question.choices.map((option, i) => (
                  <li
                    key={i}
                    className={`${
                      i === question.correctAnswer
                        ? "text-green-600 font-bold pb-2"
                        : "pb-2"
                    }`}
                  >
                    {option || "ไม่มีตัวเลือก"}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">ไม่มีตัวเลือก</li>
              )}
            </ol>
            {question.answerExplanation && (
              <p className="text-xs md:text-sm text-gray-500 mt-2 text-justify">
                <span className="font-bold ">คำอธิบาย:</span>{" "}
                {question.answerExplanation}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">ไม่มีคำถาม</p>
      )}

      <div className="flex justify-center">
        <button
          className="mt-6 px-4 py-2 text-xs md:text-base bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => navigate("/ListQuiz-teacher")}
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
};

export default QuizDetails;
