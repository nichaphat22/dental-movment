import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import quizService from "../../../utils/quizService";
import { useNavigate } from "react-router-dom";
import { PiClipboardTextDuotone } from "react-icons/pi";
import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { baseUrl } from "../../../utils/services";
import { Spinner } from "react-bootstrap";

const QuizList = () => {
  const user = useSelector((state) => state.auth.user); // รับข้อมูลผู้ใช้จาก Redux
  const roleData = useSelector((state) => state.auth.roleData);
  const [quizzes, setQuizzes] = useState([]); // เก็บข้อมูลแบบทดสอบ
  const [quizScores, setQuizScores] = useState({}); // เก็บคะแนนแบบทดสอบ
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // ข้อมูล student จาก user
  const studentId = roleData;
  console.log(user);
  console.log(studentId);

  // ฟังก์ชันดึงข้อมูลแบบทดสอบ
  const fetchQuizzes = async () => {
    try {
      const response = await quizService.getAllQuiz();
      if (response.data && Array.isArray(response.data.quiz)) {
        console.log("รายการแบบทดสอบที่ดึงได้:", response.data.quiz);
        setQuizzes(response.data.quiz);
      } else {
        console.error("คาดหวังข้อมูลเป็นอาเรย์ แต่ได้รับ:", response.data);
        setQuizzes([]); // รีเซ็ต quiz ถ้าข้อมูลไม่ถูกต้อง
      }
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลแบบทดสอบได้:", error);
      setQuizzes([]); // รีเซ็ต quiz ถ้าเกิดข้อผิดพลาด
    }
  };

  const fetchStudentScores = async (studentId) => {
    if (!studentId) {
      console.error("❌ studentId เป็น null หรือ undefined");
      return;
    }

    try {
      const response = await quizService.getQuizResults(studentId);
      if (response.data) {
        const scores = {};
        response.data.forEach((result) => {
          scores[result.quiz?._id] = result.score;
        });
        setQuizScores(scores);
      } else {
        console.error("❌ ไม่พบผลคะแนน");
      }
    } catch (error) {
      console.error("❌ ไม่สามารถดึงผลคะแนนนักเรียนได้:", error);
    }
  };

  // ตรวจสอบ user และ studentId ก่อนดึงข้อมูล
  useEffect(() => {
    if (user && studentId) {
      fetchQuizzes(); // ดึงข้อมูล quiz
      fetchStudentScores(studentId); // ดึงข้อมูลผลคะแนนของนักเรียน
    } else {
      console.error("ไม่มีข้อมูลผู้ใช้หรือ studentId");
      // สามารถใส่การแสดงผลที่เหมาะสม เช่น การแจ้งเตือนผู้ใช้
    }
  }, [user, studentId]);

  const handleAction = async (
    actionType,
    animationId = null,
    quizId = null,
    quizTitle = null
  ) => {
    if (!user) return; // เช็คว่า user มีค่าก่อน

    try {
      await axios.post(`${baseUrl}/recent`, {
        userId: user._id, // ใช้ userId ที่ได้จาก useSelector
        action: actionType,
        animationId,
        quizId,
        quizTitle,
      });
    } catch (error) {
      console.error("Error saving action:", error);
    }
  };

  // การคลิกเพื่อดูรายละเอียดแบบทดสอบ
  const handleQuizClick = (id, title) => {
    handleAction("ทำแบบทดสอบ", null, id, title);
    navigate(`/Quiz/${id}`);
  };

  // ถ้าไม่มีข้อมูลผู้ใช้ หรือ quizzes ยังไม่ได้ถูกโหลด
  if (!user || !studentId || quizzes.length === 0) {
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
          <span className="text-gray-500 text-lg font-normal">
            กำลังโหลด...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 gap-6 mt-4 lg:mx-40 cursor-pointer">
      {quizzes.length > 0 ? (
        quizzes.map((quiz) => {
          const score = quizScores[quiz._id]; // หาคะแนนสำหรับ quiz นี้

          return (
            <div
              key={quiz._id}
              onClick={() => handleQuizClick(quiz._id)}
              className="relative p-2 md:p-4 bg-white lg:hover:border-b-4 lg:hover:border-purple-500 inset-shadow-xs rounded-md drop-shadow-xl transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-x-105"
            >
              <div className="flex items-center">
                <div className="flex flex-col justify-center w-full px-2 lg:px-4">
                  <div>
                    <div className="flex items-center m-2 space-x-2 md:space-x-6">
                      <PiClipboardTextDuotone className="text-xl md:text-3xl lg:text-4xl text-purple-600 mt-2 flex-shrink-0" />
                      <h3 className="text-sm md:text-lg lg:text-xl font-bold text-gray-700 cursor-pointer break-words whitespace-normal">
                        {quiz.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 ml-9 md:ml-16 mb-2">
                      จำนวนข้อ: {quiz.questions?.length || 0}
                    </p>
                    {/* <p>
                      ผู้สร้าง: {quiz.teacher?.user?.name || "ไม่มีครูที่กำหนด"}
                    </p> */}
                  </div>

                  <div className="px-2 w-full">
                    <div className="mb-1 flex items-center justify-end gap-4">
                      <Typography
                        color="blue-gray"
                        className="text-xs font-medium"
                      >
                        {score !== undefined
                          ? `${score}/${quiz.questions.length}`
                          : "ยังไม่ได้ทำ"}
                      </Typography>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-4 text-xs mb-2 text-gray-600 text-end">
                    วันที่สร้าง:{" "}
                    {new Date(quiz?.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center flex justify-center mt-2">
          ไม่มีแบบทดสอบให้แสดง
        </p>
      )}
    </div>
  );
};

export default QuizList;
