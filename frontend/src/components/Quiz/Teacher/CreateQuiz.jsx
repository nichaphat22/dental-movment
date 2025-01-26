import React, { useState } from "react";
import quizService from "../../../utils/quizService";
import Swal from "sweetalert2";
import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../../../public/imgQuiz.svg";
import { CiSquareRemove } from "react-icons/ci";
import { HiPlusSm } from "react-icons/hi";
import { HiOutlineX } from "react-icons/hi";
import { FiImage } from "react-icons/fi"; // เพิ่มการนำเข้าไอคอน

const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      answerExplanation: "",
      image: "",
      imageName: "",
    },
  ]);
  const [image, setImage] = useState(); // ตั้งค่า default image
  const navigate = useNavigate();
  

  // Question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        choices: ["", "", "", ""],
        correctAnswer: 1,
        answerExplanation: "",
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === "question") {
      updatedQuestions[index].question = value;
    } else if (field.startsWith("choices")) {
      const choiceIndex = parseInt(field.split("-")[1], 10);
      updatedQuestions[index].choices[choiceIndex] = value;
    } else if (field === "correctAnswer") {
      updatedQuestions[index].correctAnswer = parseInt(value, 10);
    } else if (field === "answerExplanation") {
      updatedQuestions[index].answerExplanation = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleQuestionImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].image = reader.result; // บันทึก Base64 ของรูปภาพในคำถาม
        setQuestions(updatedQuestions);
      };
      reader.readAsDataURL(file);
    } else {
      updatedQuestions[index].image = ""; // ตั้งค่า image ให้เป็นค่าว่าง
      setQuestions(updatedQuestions);

      toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].image = "";
    updatedQuestions[index].imageName = ""; 
    setQuestions(updatedQuestions);
  };

  // เพิ่มการจัดการไฟล์รูปภาพ
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result); // บันทึก Base64 ของภาพ
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
    }
  };

  //ลบรูปภาพ title
  const handleRemoveImageTitle = () => {
    setImage(null);
  }
  
  const handleDeleteQuestion = (index) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบคำถามนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ลบคำถาม",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        Swal.fire("ลบสำเร็จ!", "คำถามถูกลบเรียบร้อยแล้ว", "success");
      }
    });
  };
  
  const handleCancelEdit = () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การยกเลิกจะไม่บันทึกข้อมูลที่คุณแก้ไขไว้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ยกเลิก",
      cancelButtonText: "ไม่, กลับไปแก้ไข",
    }).then((result) => {
      if (result.isConfirmed) {
        // ถ้าผู้ใช้กดยืนยันให้เปลี่ยนเส้นทาง
        navigate("/ListQuiz");
      }
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!title || !description || questions.some(q => !q.question || q.choices.some(choice => !choice))) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน และเพิ่มคำถามให้ครบ", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
      return;
    }

    const quizData = {
      title,
      image,
      description,
      questions,
    };

    try {
      await quizService.createQuiz(quizData);
      setTitle("");
      setImage(defaultImage);
      setDescription("");
      setQuestions([]);
    
      navigate(`/ListQuiz`, { state: { success: true, message: "Quiz created successfully!" } });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Flip,
      });
    }
  };

  return (
    
    <div className="relative p-10 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <ToastContainer  />             
      <h1 className="text-4xl font-medium text-purple-500 mb-4 text-center">เพิ่มแบบทดสอบ</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            ชื่อแบบทดสอบ: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-black sm:w-full lg:ml-4 border p-2 w-4/5 "
          />
        </div>
        <div>
          <label>รูปภาพ: </label>
          <div className="relative text-center flex justify-center mt-2">
            {image ? (
            <>
              <img
              src={image || defaultImage}
              alt="Quiz"
              className="w-40 h-40 object-cover border shadow-none hover:transform-none"
            />
              <label 
              htmlFor="file-upload"
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              title="เพิ่มรูปภาพ">
                  <FiImage className="w-10 h-10 text-gray-800 opacity-70 hover:text-gray-500"/>
              </label>
              <div>
                <button
                  onClick={handleRemoveImageTitle}
                  type="button"
                  className="absolute inline-flex size-5  text-red-600 rounded-full"
                  title="ลบรูปภาพ"
                  >
                  <HiOutlineX className="w-3 h-3" />
                </button>
              </div>
            </>
            ) : (
              <>
              <img 
                src={defaultImage} 
                alt="ภาพแบบทดสอบ"
                className="w-40 h-40 object-cover border shadow-none" 
              />
              <label 
              htmlFor="file-upload"
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              title="เพิ่มรูปภาพ">
                  <FiImage className="w-10 h-10 text-gray-800 opacity-70 hover:text-gray-500"/>
              </label>

              </>
        
            )}
            </div>
              {/* hidded input */}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
          />
            
        </div>

        <div className="mt-4">
          <label>คำอธิบาย: </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-black border p-2 w-full rounded"
          ></textarea>
        </div>

        {/* คำถาม */}
        <div>
          <label>คำถาม: <span style={{ color: "red" }}>*</span></label>
        </div>
        <div className="relative mb-6 p-4 border rounded-md bg-gray-50 shadow-sm">
        {questions.map((q, index) => (
          <div key={index} className="p-2">
            <h2 className="text-lg font-semibold mb-2">คำถามที่ {index + 1}</h2>
            <HiOutlineX 
              onClick={() => handleDeleteQuestion(index)}
              className="absolute -mt-8 right-10 text-xl cursor-pointer text-red-600"
            />
            <input
              type="text"
              placeholder="คำถาม"
              value={q.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              className="text-black mb-4 border p-2 w-full"
            />
             {/* เพิ่มส่วนสำหรับแสดงรูปภาพหรือไอคอน */}
             <label>รูปภาพคำถาม:</label>
              <div className="relative text-center flex justify-center mt-2 mb-4">
                {q.image ? (
                  <>
                    <img
                      src={q.image} // แสดงรูปภาพที่อัปโหลด
                      alt={`Question ${index + 1}`}
                      className="max-w-80 max-h-48 object-cover border rounded-none hover:transform-none shadow-none"
                    />
                    <label 
                      htmlFor={`file-uploadImgQ-${index}`}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      title="เพิ่มรูปภาพ"
                      >
                        <FiImage className="w-16 h-16 text-gray-800 opacity-70 hover:text-gray-500"/>
                    </label>
                    <div>
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inline-flex size-5  text-red-600 rounded-full"
                        title="ลบรูปภาพ"
                        >
                          <HiOutlineX className="w-3 h-3" />
                      </button>
                    </div>                  
                  </>
                ) : (
                  <>
                    <div className=" w-40 h-40 flex items-center justify-center border border-dashed text-gray-500">
                    <FiImage className="w-10 h-10" /> {/* ไอคอนรูปภาพ */}
                  </div>
                  <label 
                    htmlFor={`file-uploadImgQ-${index}`} 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    title="เพิ่มรูปภาพ"
                    >
                      <FiImage className="w-10 h-10 text-gray-800 opacity-70 hover:text-gray-500"/>
                    </label>
                  </>
                  
                   
                )}
              </div>
              <input
                id={`file-uploadImgQ-${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleQuestionImageUpload(index, e)}
                className="hidden"
              />
              {/* Choices */}
            {q.choices.map((choice, cIndex) => (
              <div key={cIndex}>
                <input
                  type="text"
                  placeholder={`ตัวเลือก ${cIndex + 1}`}
                  value={choice}
                  onChange={(e) => handleQuestionChange(index, `choices-${cIndex}`, e.target.value)}
                  className="border p-2 w-full mb-2 text-black text-sm"
                />
              </div>
            ))}

            {/* Correct Answer */}
            <label>
              <span>เลือกคำตอบที่ถูกต้อง:</span>
              <select
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                className="text-black ml-2 border p-2 rounded"
              >
                {q.choices.map((_, idx) => (
                  <option key={idx} value={idx}>
                    ตัวเลือก {idx + 1}
                  </option>
                ))}
              </select>
            </label>
            <br />

            {/* Answer Explanation */}
            <label>
              คำอธิบายคำตอบ:
            </label>
            <br />
            <textarea
                value={q.answerExplanation}
                onChange={(e) => handleQuestionChange(index, "answerExplanation", e.target.value)}
                className="text-black resize h-32 border-gray-200 border p-2 w-full rounded"
              ></textarea>

           
          </div>
        ))}



          <div className="flex justify-center mt-4\">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="bg-blue-500 text-white p-2 mt-2 rounded"
            >
              เพิ่มคำถาม
            </button>
          </div>
          
        </div>

        <div className="flex justify-center mt-4">
            <button type="submit" 
              className="bg-green-500 text-white p-2 mt-4 rounded flex items-center">
              <HiPlusSm className="w-5 h-5 mr-2" />สร้างแบบทดสอบ
            </button>

            <button  
              onClick={handleCancelEdit} 
              className="border bg-red-700 text-white p-2 mt-4 rounded flex items-center">
              <HiOutlineX className="w-5 h-5 mr-2" />ยกเลิก
            </button>
        </div>
        
      </form>
    </div>
  );
};

export default CreateQuiz;
