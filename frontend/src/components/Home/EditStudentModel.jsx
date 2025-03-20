import React, { useState, useEffect } from 'react'; 
import { GoX } from "react-icons/go";

const EditStudentModel = ({ isOpen, onClose, student, onSave }) => {
    const [formData, setFormData] = useState({
        studentID: "",
        name: "",
        email: "",
    });

    useEffect(() => {
        if (student) {
            setFormData({
                studentID: student.studentID,
                name: student.user?.name || "",
                email: student.user?.email || "", 
            });
        }
    }, [student]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "number" ? Number(value) : value
        });
    };

    const handleSubmit = () => {
        if ( !formData.studentID || !formData.name || !formData.email) {
            alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-96' onClick={(e) => e.stopPropagation()}>
                <div className='flex justify-center mb-4'>
                    <h2 className='text-lg font-semibold'>แก้ไขข้อมูลนักศึกษา</h2>
                </div>

                <div className='text-left space-y-2'>
                <label className='ml-1'>Student ID</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className='w-full border p-2 rounded'
                    />
                    <label className='ml-1'>ชื่อ</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className='w-full border p-2 rounded'
                    />

                    <label className='ml-1'>Email</label>
                    <input
                        type='email'
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full border p-2 rounded'
                    />

            
                </div>

                <div className='flex justify-center mt-4'>
                    <button className='bg-gray-500 text-white px-4 py-2 rounded mr-2' onClick={onClose}>
                        ยกเลิก
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${!formData.studentID || !formData.name || !formData.email  ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                        onClick={handleSubmit}
                        disabled={!formData.studentID || !formData.name || !formData.email }
                    >
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStudentModel;
