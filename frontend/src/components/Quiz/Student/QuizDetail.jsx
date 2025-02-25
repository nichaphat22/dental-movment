import React, { useEffect, useState } from 'react';
import quizService from '../../../utils/quizService';
import { useNavigate, useParams } from 'react-router-dom';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(id);
        setQuiz(response.data.quiz);
        console.log('Quiz data:', response.data.quiz); // ตรวจสอบข้อมูลที่ได้รับ
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };
    fetchQuiz();
  }, [id]);

  if (!quiz) {
    return (
      <div className="relative p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md mt-24 md:mx-16 lg:mx-32">
      <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-500">
       {/* ชื่อแบบทดสอบ: {quiz.title || 'ไม่มีชื่อแบบทดสอบ'} */}
       {quiz.title || 'ไม่มีชื่อแบบทดสอบ'}
      </h1>
      {/* จำนวนคำถาม */}
      <p className="text-xs md:text-sm text-gray-600  mb-2">
        จำนวนข้อ: {quiz.questions?.length || 0}
      </p>
      

      <p className="text-gray-600 mb-2 text-xs md:text-sm">
      คำอธิบาย:  {quiz.description || 'ไม่มีคำอธิบาย'}
      </p>

      <p className="mt-2 text-xs md:text-sm text-gray-600 text-end">
        วันที่สร้าง: {new Date(quiz.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      
                

      <hr className='mt-2'/>
      <div className="flex justify-center">
        <button
          className="mt-6 px-4 py-2 text-xs md:text-base bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => navigate(`/Quiz/${id}/start`)}
        >
          เริ่มแบบทดสอบ
        </button>
      </div>
    </div>
  );
};

export default QuizDetail;
