import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Quiz = () => {
    const navigate = useNavigate();
    const handleStartQuiz = () => {
        try {
            const result = Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "เริ่มทำแบบทดสอบ"
                }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/QuizStart');
                   
                }
            })
        } catch (error) {
            
        }

    }
  return (
    <div>
        <div className="container">
            <div className='font-semibold text-2xl pb-2'>
                <h1 className="border-b-2 border-indigo-500 pb-2">แบบทดสอบ</h1>               
            </div>
            {/* card  */}
            <div className='grid grid-cols-1 gap-6 mt-10'>
                <div className='mx-4 bg-white rounded-xl shadow-md relative'>
                    <div className='p-4 pb-4 md:px-5 lg:px-10'>
                        <div className='mb-1 '>
                            <div className="flex items-center justify-between text-lg">
                                <div className='flex flex-row'>
                                    <div className='mr-4 md:mr-8 lg:mr-8'>ชื่อแบบทดสอบ</div>
                                    <div className='mr-4 md:mr-3 lg:mr-8'> จำนวนข้อ</div>
                                    
                                </div>
                                
                            </div>
                            <div className='flex items-center justify-between text-gray-600 text-sm'>
                                <div className='flex flex-row'>
                                    <div className='mr-7 md:mr-11 lg:mr-11'></div>
                                    <div className='mr-6 md:mr-5 lg:mr-10'> -</div>
                                    <div className='mr-4 md:mr-3 lg:mr-8 font-xl'>-</div>
                                </div>
                                <div className='text-left'></div>
                            </div>
                        </div>
                    </div>
                    <div className='border border-gray-100 mb-5'></div>
                    <div className="flex justify-center mb-10">
                        <button
                        onClick={handleStartQuiz}
                            className="border-1 p-2 px-4 text-white rounded-full items-center bg-indigo-500 shadow-lg shadow-indigo-500/50"
                        >
                            เริ่มทำแบบทดสอบ
                        </button>
                    </div>
                </div>
                    {/* <div className="text-center">ไม่มีแบบทดสอบให้แสดง</div> */}
            </div>
        </div>    
    </div>
  )
}

export default Quiz
