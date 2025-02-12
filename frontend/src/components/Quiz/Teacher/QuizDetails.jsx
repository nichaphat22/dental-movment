import React, { useEffect, useState } from 'react'
import quizService from '../../../utils/quizService'
import { useNavigate, useParams } from 'react-router-dom'
import { CiMenuKebab ,CiEdit, CiTrash} from "react-icons/ci";
import Swal from 'sweetalert2';

const QuizDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
          try {
            const response = await quizService.getQuizById(id);
            setQuiz(response.data.quiz);
            console.log("Quiz data:", response.data.quiz); // ตรวจสอบข้อมูลที่ได้รับ
          } catch (error) {
            console.error("Error fetching quiz:", error);
          }
        };
        fetchQuiz();
      }, [id]);

      const handleEditQuiz = (id) => {
        navigate(`/quiz/${id}/edit`);
        console.log(id)
      }
    
      const handleDeleteQuiz = (id) => {
        Swal.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'ลบ',
          cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await quizService.deleteQuiz(id);
              Swal.fire('ลบสำเร็จ!', 'แบบทดสอบได้ถูกลบเรียบร้อยแล้ว', 'success');
              navigate('/ListQuiz'); // กลับไปที่หน้ารายชื่อควิซ
            } catch (error) {
              if (error.response) {
                console.error('เกิดข้อผิดพลาดในการลบควิซ:', error.response.data);
                Swal.fire('เกิดข้อผิดพลาด', error.response.data.message, 'error');
              } else if (error.request) {
                console.error('ไม่สามารถติดต่อกับเซิร์ฟเวอร์:', error.request);
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถติดต่อกับเซิร์ฟเวอร์', 'error');
              } else {
                console.error('ข้อผิดพลาดอื่น ๆ:', error.message);
                Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ', 'error');
              }
            }
          }
        });
      };
      
      

    if (!quiz) {
        return <div>Loading...</div>; // แสดงหน้ารอโหลดข้อมูล
    }
    if (!quiz.questions || quiz.questions.length === 0) {
        return <div>ไม่มีคำถามในแบบทดสอบนี้</div>; // กรณีไม่มีคำถาม
      }

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
    {/* <CiEdit className="absolute top-4 right-10 text-xl cursor-pointer text-gray-500"/> */}
    <CiTrash onClick={() => handleDeleteQuiz(quiz._id)}  className="absolute top-4 right-4 text-xl cursor-pointer text-gray-500" />
    <CiEdit  onClick={() => handleEditQuiz(quiz._id)} className="absolute top-4 right-10 text-xl cursor-pointer text-gray-500"/>


      <h1 className="text-2xl font-bold text-gray-800 mb-2">

        {quiz.title || "ไม่มีชื่อแบบทดสอบ"}
      </h1>
      {/* จำนวนคำถาม */}
      <p className="text-sm text-gray-600  mb-2">
        จำนวนข้อ: {quiz.questions?.length || 0}
      </p>
      <p className="text-gray-600 mb-6">คำอธิบาย :{quiz.description || "ไม่มีคำอธิบาย"}</p>

      <p className="mt-2 text-sm text-gray-600 text-end">
        วันที่สร้าง: {new Date(quiz.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      <h2 className="text-xl font-semibold text-gray-700 mb-4">คำถาม</h2>


      {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question, index) => (
                <div
                key={index}
                className="mb-6 p-4 border rounded-md bg-gray-50 shadow-sm"
                >
                <p className="text-lg font-medium text-gray-800 mb-2">
                    {index + 1}. {question.question || "ไม่มีคำถาม"}
                </p>
                <div className='relative flex items-center justify-center text-center mb-4'>
                  {question.image && (
                    <img 
                    src={question.image} 
                    alt={`Question ${index + 1}`}
                    className="max-w-80 h-auto rounded-lg border shadow-none"
                      />
                  )}
                  
                </div>
                <ol className="list-decimal pl-6 text-gray-700">
                    {question.choices && question.choices.length > 0 ? (
                    question.choices.map((option, i) => (
                        <li
                        key={i}
                        className={`${
                            i === question.correctAnswer ? "text-green-600 font-bold" : ""
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
                    <p className="text-sm text-gray-600 mt-2">
                    คำอธิบาย: {question.answerExplanation}
                    </p>
                )}
                </div>
            ))
            ) : (
        <p className="text-gray-500">ไม่มีคำถาม</p>
        )}

      <div className="flex justify-center">
        <button
          className="mt-6 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => navigate("/ListQuiz")}
        >
          ย้อนกลับ
        </button>
      </div>
     
    </div>
    
  )
}

export default QuizDetails
