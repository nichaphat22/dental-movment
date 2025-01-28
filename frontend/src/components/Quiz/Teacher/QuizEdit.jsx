import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../../utils/quizService";
import { CiMenuKebab, CiEdit } from "react-icons/ci";
import { HiOutlineX } from "react-icons/hi";
import { RiDeleteBinLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { FiImage } from "react-icons/fi";
import defaultImage from "../../../../public/imgQuiz.svg";

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
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

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      answerExplanation: "",
      deleted: false, // ค่า default คือ false เพราะมันยังไม่ได้ถูกลบ
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const handleDeleteQuestion = async (index) => {
    // แสดง SweetAlert เพื่อยืนยันการลบ
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
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
      alert("Title and Description cannot be empty.");
      return;
    }

    if (!quiz.questions.length) {
      alert("Quiz must have at least one question.");
      return;
    }

    for (const question of quiz.questions) {
      if (!question.question.trim()) {
        alert("All questions must have text.");
        return;
      }

      if (
        !question.choices.length ||
        question.choices.some((opt) => !opt.trim())
      ) {
        alert("Each question must have at least one choice with valid text.");
        return;
      }

      if (
        question.correctAnswer === undefined ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.choices.length
      ) {
        alert("Correct answer must be a valid choice index.");
        return;
      }
    }

    try {
      // อัปเดตข้อมูลควิซ
      await quizService.updateQuiz(id, {
        title: quiz.title,
        description: quiz.description,
      });

      // ลบคำถามที่มีสถานะ deleted
      const deletedQuestions = quiz.questions.filter(
        (question) => question.deleted
      );
      for (const question of deletedQuestions) {
        if (question._id) {
          await quizService.deleteQuestion(id, question._id);
        }
      }

      // เพิ่มหรืออัปเดตคำถาม
      const activeQuestions = quiz.questions.filter((q) => !q.deleted);
      for (const question of activeQuestions) {
        if (question._id) {
          // อัปเดตคำถามเดิม
          await quizService.updateQuestion(id, question._id, question);
        } else {
          // สร้างคำถามใหม่
          await quizService.createQuestion(id, question);
        }
      }

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
        navigate("/ListQuiz");
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
        navigate("/ListQuiz");
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
    navigate("/ListQuiz");
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

  //ลบรูปภาพ title
  const handleRemoveImageTitle = () => {
    setImage(null);
  };

  if (isLoading) {
    return <div>Loading quiz details, please wait...</div>;
  }

  if (!quiz) {
    return <div>Error: Could not find quiz data. Please try again later.</div>;
  }

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-500 mb-12 text-center">
        แก้ไขแบบทดสอบ
      </h1>

      <div>
        {/* <label>รูปภาพ: </label> */}
        <div className="relative text-center flex justify-center mt-2 mb-4">
          {image ? (
            <>
              <img
                src={image || defaultImage}
                alt="Quiz"
                className="w-48 h-48 object-cover border shadow-none hover:transform-none"
              />
              <label
                htmlFor="file-upload"
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                title="เพิ่มรูปภาพ"
              >
                <FiImage className="w-10 h-10 text-gray-800 opacity-70 hover:text-gray-500" />
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
                className="w-48 h-48 object-cover border shadow-none"
              />
              <label
                htmlFor="file-upload"
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                title="เพิ่มรูปภาพ"
              >
                <FiImage className="w-10 h-10 text-gray-800 opacity-70 hover:text-gray-500" />
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

      {/* Edit Quiz Title */}
      <label className="flex sm:text-lg lg:text-2xl mb-4">
        <span className="flex-auto font-bold text-gray-800 w-64 text-end pr-2">
          ชื่อแบบทดสอบ:
        </span>
        <input
          type="text"
          value={quiz.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="border-gray-200 pl-4 py-2 pr-2 w-full"
        />
      </label>

      {/* Edit Quiz Description */}
      <label className="flex justify-center sm:text-lg lg:text-2xl mb-4">
        <span className="flex-auto font-bold text-gray-800 w-64 text-end pr-2">
          คำอธิบาย:
        </span>
        <textarea
          value={quiz.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="border-gray-200 border p-2 pr-2 w-full rounded"
        ></textarea>
      </label>

      <hr className="pb-2" />

      {/* Questions */}
      {quiz.questions
        .filter((question) => !question.deleted)
        .map((question, qIndex) => (
          <div
            className="relative mt-8 mb-6 p-4 border rounded-md bg-gray-50 shadow-sm lg:text-xl"
            key={qIndex}
          >
            <HiOutlineX
              onClick={() => handleDeleteQuestion(qIndex)}
              title="ลบคำถาม"
              className="absolute top-2 right-2 text-xl cursor-pointer text-red-600 w-4 h-4"
            />
            {/* Question Input */}
            <label className="flex mb-4 mt-2">
              <span className="pr-4 py-2">{qIndex + 1}.</span>
              <input
                type="text"
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "question", e.target.value)
                }
                className="border border-none border-b-pink-200 w-full py-2 pr-2 pl-4"
              />
            </label>
            {/* เพิ่มแก้ไขลบรูปภาพ */}
            <label>รูปภาพคำถาม</label>
            <div className="relative text-center flex justify-center mt-2 mb-4">
              {question.image ? (
                <>
                  <img
                    src={question.image} // แสดงรูปภาพที่อัปโหลด
                    alt={`Question ${qIndex + 1}`}
                    className="max-w-80 max-h-48 object-cover border rounded-none hover:transform-none shadow-none"
                  />
                  <label
                    htmlFor={`file-imgQ-${qIndex}`}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    title="เพิ่มรูปภาพ"
                  >
                    <FiImage className="w-16 h-16 text-gray-800 opacity-70 hover:text-gray-500" />
                  </label>
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
                <>
                  <div className="w-40 h-40 flex items-center justify-center border border-dashed text-gray-500">
                    <FiImage className="w-10 h-10" /> {/* ไอคอนรูปภาพ */}
                  </div>
                  <label
                    htmlFor={`file-imgQ-${qIndex}`}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    title="เพิ่มรูปภาพ"
                  >
                    <FiImage className="w-10 h-10 text-gray-800 opacity-70 hover:text-gray-500" />
                  </label>
                </>
              )}
            </div>
            <input
              id={`file-imgQ-${qIndex}`}
              type="file"
              accept="image/*"
              onChange={(e) => handleQuestionImageUpload(index, e)}
              className="hidden"
            />

            {/* Choices */}
            {question.choices.map((choice, oIndex) => (
              <div key={oIndex}>
                <label className="flex mb-2">
                  <span className="pr-4 pl-8 py-2">{oIndex + 1}.</span>
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => {
                      const updatedChoices = [...question.choices];
                      updatedChoices[oIndex] = e.target.value;
                      handleQuestionChange(qIndex, "choices", updatedChoices);
                    }}
                    className="w-full  border border-none py-2 pl-4 pr-2"
                  />
                </label>
              </div>
            ))}

            {/* Correct Answer */}
            <label>
              <span>เลือกคำตอบที่ถูกต้อง:</span>
              <select
                value={question.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "correctAnswer", e.target.value)
                }
                className="ml-2 border p-2 rounded mb-4"
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
              <span>คำอธิบายคำตอบ:</span>
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
              className="resize h-32 border-gray-200 border p-2 w-full rounded lg:text-sm"
            ></textarea>

            {/* Delete Question Button */}
            {/* <button
              onClick={() => handleDeleteQuestion(qIndex)}
              className="border bg-red-500 rounded p-2 text-white mt-4"
            >
              ลบคำถาม
            </button> */}
          </div>
        ))}

      {/* Add Question Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleAddQuestion}
          className="border bg-blue-500 rounded p-2 text-white"
        >
          เพิ่มคำถามใหม่
        </button>
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          className="border bg-green-800 rounded p-2 text-white flex items-center mr-4"
        >
          บันทึก
        </button>
        <button
          onClick={handleCancelEdit}
          className="border bg-gray-500 rounded p-2 text-white"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default QuizEdit;
