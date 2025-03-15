import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Textarea } from "@material-tailwind/react";
import quizService from "../../../utils/quizService";
import { HiOutlineX, HiPlus } from "react-icons/hi";
import Swal from "sweetalert2";
import {
  GoTrash,
  GoDuplicate,
  GoChevronDown,
  GoChevronUp,
} from "react-icons/go";
import { RiImageAddLine } from "react-icons/ri";

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    questions: [],
  });
  const questionRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(id);
        setQuiz(response.data.quiz);
        console.log("Quiz data:", response.data.quiz);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        alert("Failed to load quiz data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // question
  const handleAddQuestion = (index) => {
    const newQuestion = {
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      answerExplanation: "",
      deleted: false,
    };

    //แทรกตำแหน่งคำถาม
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index + 1, 0, newQuestion); // เพิ่มคำถามหลังตำแหน่งที่เลือก
    setQuiz({ ...quiz, questions: updatedQuestions });

    setTimeout(() => {
      questionRefs.current[index + 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  //add choices
  const handleAddChoices = (qIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].choices.push("");
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // remove choices
  const handleDeleteChoice = (qIndex, oIndex) => {
    const updatedQuestions = [...quiz.questions];

    //ป้องกันไม่ให้ตัวเลือกถูกลบจนเหลือ 0 ตัวเลือก
    if (updatedQuestions[qIndex].choices.length > 1) {
      updatedQuestions[qIndex].choices.splice(oIndex, 1);

      // ถ้าคำตอบที่ถูกต้องถูกลบ ให้เปลี่ยนค่า `correctAnswer` ไปที่ตัวเลือกแรก
      if (updatedQuestions[qIndex].correctAnswer === oIndex) {
        updatedQuestions[qIndex].correctAnswer = 0;
      }

      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const handleDeleteQuestion = async (index) => {
    // แสดง SweetAlert เพื่อยืนยันการลบ
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบคำถามนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบคำถาม",
      cancelButtonText: "ยกเลิก",
    });

    // ถ้าผู้ใช้ยืนยันการลบ
    if (!result.isConfirmed) {
      return;
    }

    // ลบคำถามจาก UI ทันที
    const updatedQuestions = [...quiz.questions]; // คัดลอกคำถามทั้งหมด
    const deletedQuestion = updatedQuestions.splice(index, 1); // ลบคำถามที่ index ที่เลือก
    setQuiz({ ...quiz, questions: updatedQuestions }); // อัปเดต state ให้แสดงคำถามใหม่

    // ถ้าคำถามที่ถูกลบมี id (หมายถึงมันถูกบันทึกในฐานข้อมูล)
    const questionToDelete = deletedQuestion[0];
    if (questionToDelete._id) {
      try {
        // เรียกฟังก์ชันลบคำถามจากฐานข้อมูล
        await quizService.deleteQuestion(id, questionToDelete._id);
        Swal.fire("Deleted!", "The question has been removed.", "success");
      } catch (error) {
        console.error("Error deleting question:", error);
        Swal.fire(
          "Error!",
          "There was an error deleting the question.",
          "error"
        );
      }
    }
  };

  const handleQuestionImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[index].image = reader.result; // บันทึก Base64 ของรูปภาพในคำถาม
        setQuiz({ ...quiz, questions: updatedQuestions });
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

  //สลับตำแหน่งคำถาม
  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedQuestions = [...quiz.questions];
      [updatedQuestions[index], updatedQuestions[index - 1]] = [
        updatedQuestions[index - 1],
        updatedQuestions[index],
      ];
      setQuiz({ ...quiz, questions: updatedQuestions });

      setTimeout(() => {
        questionRefs.current[index - 1]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };

  const handleMoveDown = (index) => {
    if (index < quiz.questions.length - 1) {
      const updatedQuestions = [...quiz.questions];
      [updatedQuestions[index], updatedQuestions[index + 1]] = [
        updatedQuestions[index + 1],
        updatedQuestions[index],
      ];
      setQuiz({ ...quiz, questions: updatedQuestions });

      setTimeout(() => {
        questionRefs.current[index + 1]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
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

  const handleSave = async () => {
    // ตรวจสอบข้อมูลก่อนที่จะบันทึก
    if (!quiz.title.trim() || !quiz.description.trim()) {
      Swal.fire("Error", "Title and Description cannot be empty.", "error");
      return;
    }
  
    if (!quiz.questions.length) {
      Swal.fire("Error", "Quiz must have at least one question.", "error");
      return;
    }
  
    for (const question of quiz.questions) {
      if (!question.question.trim()) {
        Swal.fire("Error", "All questions must have text.", "error");
        return;
      }
  
      if (
        !question.choices.length ||
        question.choices.some((opt) => !opt.trim())
      ) {
        Swal.fire(
          "Error",
          "Each question must have at least one choice with valid text.",
          "error"
        );
        return;
      }
  
      if (
        question.correctAnswer === undefined ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.choices.length
      ) {
        Swal.fire(
          "Error",
          "Correct answer must be a valid choice index.",
          "error"
        );
        return;
      }
    }
  
    try {
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        teacher: quiz.teacher,
        questions: quiz.questions.map((q) => ({
          _id: q._id || undefined,
          question: q.question,
          choices: q.choices,
          image: q.image,
          correctAnswer: q.correctAnswer,
          answerExplanation: q.answerExplanation || "",
          deleted: q.deleted || false,
        })),
      };
  
      try {
        await quizService.updateQuiz(id, quizData);
      } catch (error) {
        console.error("Error updating quiz or questions:", error);
        if (error.response) {
          console.error("Response data:", error.response.data); // ดูข้อความผิดพลาดจากเซิร์ฟเวอร์
        }
        Swal.fire("Failed to update quiz or questions.", "", "error");
      }
      
  
      // แจ้งผลลัพธ์
      const result = await Swal.fire({
        title: "Do you want to save the changes?",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
      });
  
      if (result.isConfirmed) {
        Swal.fire("Saved!", "", "success");
        navigate("/ListQuiz-teacher");
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
        navigate("/ListQuiz-teacher");
      }
    } catch (error) {
      console.error("Error updating quiz or questions:", error);
      Swal.fire("Failed to update quiz or questions.", "", "error");
    }
  };
  
  

  const handleFieldChange = (field, value) => {
    setQuiz({ ...quiz, [field]: value });
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
        navigate("/ListQuiz-teacher");
      }
    });
  };

  const handleQuestionChange = (index, field, value) => {
    if (index < 0 || index >= quiz.questions.length) {
      console.error("Invalid question index:", index);
      return;
    }

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: field === "correctAnswer" ? parseInt(value, 10) : value,
    };

    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  if (isLoading) {
    return <div>Loading quiz details, please wait...</div>;
  }

  if (!quiz) {
    return <div>Error: Could not find quiz data. Please try again later.</div>;
  }

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-purple-500 mb-4 text-center">
        แก้ไขแบบทดสอบ
      </h1>

      {/* Edit Quiz Title */}
      <div className="flex text-sm md:text-lg lg:text-xl mb-4">
        <span className="flex-auto text-gray-500  mt-3.5  w-64 text-end md:pr-2">
          ชื่อแบบทดสอบ:
        </span>
        <Input
          value={quiz.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          variant="static"
          className="border-gray-200 text-black text-sm md:text-lg lg:text-xl pl-4 py-2 pr-2 w-full"
        />
      </div>

      {/* Edit Quiz Description */}
      <div className="flex text-sm md:text-lg lg:text-xl mb-4">
        <span className="flex-auto text-gray-500 w-40  md:w-64 text-end pr-2">
          คำอธิบาย:
        </span>
        <textarea
          value={quiz.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="text-black border-gray-200 border w-full rounded text-sm md:text-lg lg:text-xl min-h-32 pl-4 py-2 pr-2"
        ></textarea>
      </div>

      <hr className="pb-2" />

      <div className="relative">
        {/* Questions */}
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} ref={(el) => (questionRefs.current[qIndex] = el)}>
            <div className="flex justify-end mb-1 space-x-2">
              <GoChevronUp
                onClick={() => handleMoveUp(qIndex)}
                className="cursor-pointer text-gray-600 rounded-sm transition-all 
                             p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
              />
              <GoChevronDown
                onClick={() => handleMoveDown(qIndex)}
                className="cursor-pointer text-gray-600 rounded-sm transition-all 
                             p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
              />
              <GoTrash
                onClick={() => handleDeleteQuestion(qIndex)}
                title="ลบคำถาม"
                className="cursor-pointer text-gray-600 rounded-sm transition-all 
                             p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
              />
              <GoDuplicate
                onClick={() => handleAddQuestion(qIndex)}
                title="เพิ่มคำถาม"
                className="cursor-pointer text-gray-600 rounded-sm transition-all 
                             p-1 hover:p-2 hover:bg-gray-200 w-5 h-5 md:w-6 md:h-6"
              />
            </div>
            <div className="mb-6 p-4 focus-within:border-l-4 focus-within:border-purple-600 rounded-md bg-slate-50 drop-shadow-md relative transition">
              {/* Question Input */}
              <div className="flex items-center mb-4 mt-2">
                <span className="pr-4 py-2 mt-3 text-sm md:text-base ">
                  {qIndex + 1}.
                </span>
                <Input
                  variant="static"
                  color="blue-gray"
                  placeholder="พิมพ์คำถาม..."
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question", e.target.value)
                  }
                  className="p-1 text-sm md:text-base  focus:!bg-gray-50 focus:!rounded-t-md text-black"
                />
                {/* เพิ่มแก้ไขลบรูปภาพ */}
                <label
                  htmlFor={`file-imgQ-${qIndex}`}
                  className="ml-2 mt-3 cursor-pointer text-gray-300 rounded-full transition-all 
                            p-2 hover:p-4 md:hover:bg-gray-100"
                >
                  <RiImageAddLine className="text-gray-600 w-5 h-5 md:w-6 md:h-6" />
                </label>
              </div>

              <div className="relative text-center flex justify-center mt-2 mb-2">
                {question.image ? (
                  <>
                    <img
                      src={question.image} // แสดงรูปภาพที่อัปโหลด
                      alt={`Question ${qIndex + 1}`}
                      className="max-w-75 max-h-48 object-cover border rounded-none hover:transform-none shadow-none"
                    />

                    <div>
                      <button
                        onClick={() => {
                          const updatedQuestions = [...quiz.questions];
                          updatedQuestions[qIndex].image = null; // ตั้งค่าเป็น null เพื่อเคลียร์รูปภาพ
                          handleQuestionChange(qIndex, "image", null);
                        }}
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
                id={`file-imgQ-${qIndex}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleQuestionImageUpload(qIndex, e)}
                className="hidden"
              />

              {/* Choices */}
              {question.choices.map((choice, oIndex) => (
                <div key={oIndex}>
                  <label className="flex mb-2">
                    <span className="pr-4 pl-4 md:pl-8 py-2 text-sm md:text-base ">
                      {oIndex + 1}.
                    </span>
                    <textarea
                      value={choice}
                      onChange={(e) => {
                        const updatedChoices = [...question.choices];
                        updatedChoices[oIndex] = e.target.value;
                        handleQuestionChange(qIndex, "choices", updatedChoices);
                      }}
                      className="w-full text-black text-xs md:text-base border border-none py-1 pl-4 pr-2
                                rounded resize-none min-h-[40px] break-words whitespace-normal"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => handleDeleteChoice(qIndex, oIndex)}
                        className="ml-4 text-red-500 p-1 hover:p-2 hover:bg-gray-200 rounded-full"
                      >
                        <HiOutlineX className="text-red-500 w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </label>
                </div>
              ))}
              {/* ปุ่มเพิ่มตัวเลือกคำตอบ */}
              <div className="flex justify-center mb-4 mt-2">
                <button
                  type="button"
                  onClick={() => handleAddChoices(qIndex)}
                  title="เพิ่มตัวเลือก"
                  // className="bg-purple-500 hover:bg-purple-400 text-white p-2 rounded "
                  className="bg-gray-200 rounded-full p-2 hover:bg-gray-300"
                >
                  <HiPlus className="md:w-6 md:h-6 text-purple-500" />
                </button>
              </div>
              {/* Correct Answer */}
              <label>
                <span className="text-sm md:text-base ">
                  เลือกคำตอบที่ถูกต้อง:
                </span>
                <select
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      qIndex,
                      "correctAnswer",
                      e.target.value
                    )
                  }
                  className="ml-2 border p-2 rounded mb-4 text-black text-xs md:text-sm "
                >
                  {question.choices.map((_, idx) => (
                    <option key={idx} value={idx}>
                      ตัวเลือก {idx + 1}
                    </option>
                  ))}
                </select>
              </label>
              <br />
              {/* Answer Explanation */}
              <label>
                <span className="text-sm md:text-base ">คำอธิบายคำตอบ:</span>
              </label>
              <br />
              <textarea
                value={question.answerExplanation}
                onChange={(e) =>
                  handleQuestionChange(
                    qIndex,
                    "answerExplanation",
                    e.target.value
                  )
                }
                className="resize h-32 border-gray-200 border p-2 w-full rounded text-xs md:text-sm text-black"
              ></textarea>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      {/* <div className="text-center mt-6">
        <button
          onClick={handleAddQuestion}
          className="border bg-blue-500 rounded p-2 text-white"
        >
          เพิ่มคำถามใหม่
        </button>
      </div> */}

      {/* Save and Cancel Buttons */}
      <div className="flex justify-center space-x-4 mt-6 text-sm md:text-base">
        <button
          onClick={handleCancelEdit}
          className="border bg-gray-200 text-purple-600 p-2 mt-4 rounded flex items-center hover:bg-gray-300"
        >
          <HiOutlineX className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          ยกเลิก
        </button>

        <button
          onClick={handleSave}
          className="bg-purple-500 text-white p-2 mt-4 rounded flex items-center hover:bg-purple-600"
        >
          <HiPlus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          บันทึก
        </button>
      </div>
    </div>
  );
};

export default QuizEdit;
