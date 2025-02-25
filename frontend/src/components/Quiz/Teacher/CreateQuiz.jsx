import React, { useState, useRef } from "react";
import quizService from "../../../utils/quizService";
import { Input, Select, Textarea, Option } from "@material-tailwind/react";
import Swal from "sweetalert2";
import { toast, Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../../../public/imgQuiz.svg";
import { HiPlusSm } from "react-icons/hi";
import { HiOutlineX } from "react-icons/hi";
import { RiImageAddLine } from "react-icons/ri";
import {
  GoTrash,
  GoDuplicate,
  GoChevronDown,
  GoChevronUp,
} from "react-icons/go";

const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      choices: ["", ""],
      correctAnswer: 0,
      answerExplanation: "",
      image: "",
      imageName: "",
    },
  ]);
  const questionRefs = useRef([]);
  const [image, setImage] = useState(); // ตั้งค่า default image
  const navigate = useNavigate();

  // Question
  const handleAddQuestion = (index) => {
    const newQuestion = {
      question: "",
      choices: ["", ""],
      correctAnswer: 1,
      answerExplanation: "",
    };

    const updatedQuestions = [...questions];
    updatedQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(updatedQuestions);

    setTimeout(() => {
      questionRefs.current[index + 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  //add choices
  const handleAddChoices = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].choices.push("");
    setQuestions(updatedQuestions);
  };

  //remove choices
  const handleRemoveChoices = (qIndex, cIndex) => {
    const updatedQuestions = [...questions];

    if (updatedQuestions[qIndex].choices.length > 2) {
      updatedQuestions[qIndex].choices = updatedQuestions[
        qIndex
      ].choices.filter((_, i) => i !== cIndex);
      setQuestions(updatedQuestions);
    } else {
      alert("ต้องมีอย่างน้อย 2 ตัวเลือก");
    }
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
  };

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
    if (
      !title ||
      !description ||
      questions.some((q) => !q.question || q.choices.some((choice) => !choice))
    ) {
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

      navigate(`/ListQuiz`, {
        state: { success: true, message: "Quiz created successfully!" },
      });
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

  // สลับตำแหน่งคำถาม
  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedQuestions = [...questions];
      [updatedQuestions[index - 1], updatedQuestions[index]] = 
      [updatedQuestions[index], updatedQuestions[index - 1]];
      setQuestions(updatedQuestions);
  
      setTimeout(() => {
        questionRefs.current[index - 1]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };
  
  const handleMoveDown = (index) => {
    if (index < questions.length - 1) {
      const updatedQuestions = [...questions];
      [updatedQuestions[index], updatedQuestions[index + 1]] = 
      [updatedQuestions[index + 1], updatedQuestions[index]];
      setQuestions(updatedQuestions);
  
      setTimeout(() => {
        questionRefs.current[index + 1]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };
  
  return (
    <div className="relative border-t-8 border-purple-500 p-4 md:p-10 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <ToastContainer />
      <h1 className="text-lg md:text-2xl lg:text-3xl  font-bold text-purple-500 mb-4 text-center">
        เพิ่มแบบทดสอบ
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="static"
            color="blue-gray"
            placeholder="ชื่อแบบทดสอบ..."
            className="p-1 pt-4 text-sm md:text-base font-bold text-black focus:!bg-gray-50 focus:!rounded-t-md "
          />
        </div>

        <div className="my-4">
          <Textarea
            value={description}
            color="blue-gray"
            variant="outlined"
            onChange={(e) => setDescription(e.target.value)}
            label="คำอธิบาย"
            labelProps={{ className: "font-normal" }}
            className="text-sm md:text-base text-black h-44"
          />
        </div>

        {/* กรอบคำถาม */}

        <div className="relative ">
          {questions.map((q, index) => (
            <div key={index} ref={(el) => (questionRefs.current[index] = el)}>
              <div className="flex justify-end mb-1 md:space-x-2">
                <GoChevronUp
                  onClick={() => handleMoveUp(index)}
                  className="cursor-pointer text-gray-600 rounded-sm transition-all 
               p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
                />
                <GoChevronDown
                  onClick={() => handleMoveDown(index)}
                  className="cursor-pointer text-gray-600 rounded-sm transition-all 
               p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
                />
                <GoTrash
                  onClick={() => handleDeleteQuestion(index)}
                  title="ลบคำถาม"
                  className="cursor-pointer text-gray-600 rounded-sm transition-all 
               p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
                />
                <GoDuplicate
                  onClick={() => handleAddQuestion(index)}
                  title="เพิ่มคำถาม"
                  className="cursor-pointer text-gray-600 rounded-sm transition-all 
               p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
                />
              </div>
              <div className="mb-6 p-4 focus-within:border-l-4 focus-within:border-purple-600 rounded-md bg-white drop-shadow-md relative transition">
                <h2 className="text-sm md:text-base font-medium text-black mb-2">
                  คำถามที่ {index + 1}
                </h2>

                {/* คำถาม */}

                <div className="mb-2 flex items-center ">
                  <Input
                    variant="static"
                    color="blue-gray"
                    placeholder="พิมพ์คำถาม..."
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionChange(index, "question", e.target.value)
                    }
                    className="p-1 text-sm md:text-base focus:!bg-gray-50 focus:!rounded-t-md text-black"
                  />
                  {/* เพิ่มรูปภาพคำถาม */}
                  <label
                    htmlFor={`file-uploadImgQ-${index}`}
                    title="เพิ่มรูปภาพ"
                    className="ml-2 cursor-pointer text-gray-300 rounded-full transition-all 
               p-2 hover:p-4 md:hover:bg-gray-100"
                  >
                    <RiImageAddLine className="text-gray-600 w-6 h-6" />
                  </label>
                </div>

                <div className="relative text-center flex justify-center mt-4 mb-4">
                  {q.image ? (
                    <>
                      {/* <label>รูปภาพคำถาม:</label> */}
                      <img
                        src={q.image} // แสดงรูปภาพที่อัปโหลด
                        alt={`Question ${index + 1}`}
                        className="max-w-60 max-h-48 object-cover border rounded-none hover:transform-none shadow-none"
                      />

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
                    <></>
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
                <div>
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center mb-1">
                      <Input
                        variant="static"
                        color="blue-gray"
                        placeholder={`ตัวเลือก ${cIndex + 1}`}
                        value={choice}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            `choices-${cIndex}`,
                            e.target.value
                          )
                        }
                        className="p-1 text-sm md:text-base  focus:!bg-gray-100 focus:!rounded-t-md "
                        // className="border-none border-b-2  p-2 w-full mb-2 text-black text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChoices(index, cIndex)}
                        className="ml-2 text-red-500 p-2 hover:p-4 hover:bg-gray-100 rounded-full"
                      >
                        <HiOutlineX className="text-red-500 w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* ปุ่มเพิ่มตัวเลือกคำตอบ */}
                  <div className="flex justify-center mb-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleAddChoices(index)}
                      title="เพิ่มตัวเลือก"
                      // className="bg-purple-500 hover:bg-purple-400 text-white p-2 rounded "
                      className="bg-gray-50 rounded-full p-2 hover:bg-gray-100"
                    >
                      <HiPlusSm className="md:w-6 md:h-6 text-purple-500" />
                    </button>
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="flex items-center text-sm space-x-2">
                  <label className="mr-2 text-sm md:text-base whitespace-nowrap">
                    เลือกคำตอบที่ถูกต้อง:
                  </label>

                  <div className="flex w-40 flex-col gap-6 text-center">
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => {
                        handleQuestionChange(
                          index,
                          "correctAnswer",
                          e.target.value
                        );
                        e.target.blur(); // ปิด Dropdown อัตโนมัติเมื่อเลือก
                      }}
                      className="text-center text-gray-900 text-xs md:text-sm py-2 border border-gray-300 rounded-md w-full
      hover:border-gray-400  "
                    >
                      {q.choices.map((_, idx) => (
                        <option
                          key={idx}
                          value={idx}
                          className="text-xs md:text-base text-center px-3 py-2 bg-transparent focus:outline-none hover:bg-gray-200 focus:bg-gray-300 appearance-none"
                        >
                          ตัวเลือก {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Answer Explanation */}
                <label className="text-sm md:text-base">คำอธิบายคำตอบ:</label>
                <br />
                <textarea
                  value={q.answerExplanation}
                  onChange={(e) =>
                    handleQuestionChange(
                      index,
                      "answerExplanation",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2  focus:outline-gray-400 sm:text-sm/6"
                  defaultValue={""}
                ></textarea>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 space-x-4 text-xs md:text-base">
          <button
            onClick={handleCancelEdit}
            className="border bg-gray-200 text-purple-600 p-2 mt-4 rounded flex items-center hover:bg-gray-300"
          >
            <HiOutlineX className="w-4 h-4 mr-2" />
            ยกเลิก
          </button>
          <button
            type="submit"
            className="bg-purple-500 text-white p-2 mt-4 rounded flex items-center hover:bg-purple-600"
          >
            <HiPlusSm className="w-5 h-5 mr-2" />
            สร้างแบบทดสอบ
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
