import axios from "axios";
import { baseUrl } from "./services";

// const BASE_URL = "http://localhost:8080/api/quiz";

const quizService = {
// <<<<<<< HEAD
  getAllQuiz: () => axios.get(`${baseUrl}/quiz/`), // ดึงควิซทั้งหมด
  getQuizById: (id) => axios.get(`${baseUrl}/quiz/${id}`), // ดึงควิซตาม ID
  createQuiz: (quizData) => axios.post(`${baseUrl}/quiz/addQuiz`, quizData), // สร้างควิซใหม่
  updateQuiz: (id, quizData) => axios.put(`${baseUrl}/quiz/${id}`, quizData),
// =======
//   getAllQuiz: () => axios.get(`/api/quiz/`), // ดึงควิซทั้งหมด
//   getQuizById: (id) => axios.get(`/api/quiz/${id}`), // ดึงควิซตาม ID
//   createQuiz: (quizData) => axios.post(`/api/quiz/addQuiz`, quizData), // สร้างควิซใหม่
//   updateQuiz: async (id, quizData) => {
//     try {
//       // อัปเดตควิซ
//       const updatedQuiz = await axios.put(`/api/quiz/${id}`, quizData);
      
//       // หากมีการอัปเดตคำถามในควิซ
//       if (quizData.questions) {
//         // ลบคำถามที่ถูกลบในคำถามใหม่
//         const currentQuestions = await axios.get(`/api/quiz/${id}/questions`);
//         const currentQuestionIds = currentQuestions.data.map(q => q._id);
// >>>>>>> 17e3e66933ba71d74a2e3eb14960d1a5350d1d3a


// <<<<<<< HEAD
  deleteQuiz: async (id) => {
    try {
// =======
//         for (const questionId of questionsToDelete) {
//           await axios.delete(`/api/quiz/${id}/questions/${questionId}`);
//         }

//         // อัปเดตหรือเพิ่มคำถามใหม่
//         for (const question of quizData.questions) {
//           if (question._id) {
//             // อัปเดตคำถามที่มีอยู่
//             await axios.put(`/api/quiz/${id}/questions/${question._id}`, question);
//           } else {
//             // เพิ่มคำถามใหม่
//             await axios.post(`/api/quiz/${id}/questions`, question);
//           }
//         }
//       }

//       return updatedQuiz;
//     } catch (error) {
//       console.error("Error updating quiz:", error);
//       throw error;
//     }
//   }, // อัปเดตควิซ
//   deleteQuiz: async (id) => {
//     try {
//       // เรียกดูคำถามที่เกี่ยวข้องกับควิซก่อนลบ
//       const response = await axios.get(`/api/quiz/${id}/questions`);
//       const questions = response.data;
  
//       // ลบคำถามที่เกี่ยวข้องทั้งหมด
//       for (const question of questions) {
//         await axios.delete(`/api/quiz/${id}/questions/${question._id}`);
//       }
  
// >>>>>>> 17e3e66933ba71d74a2e3eb14960d1a5350d1d3a
      // ลบควิซ
      return await axios.delete(`${baseUrl}/quiz/${id}`);
    } catch (error) {
      console.error('Error deleting quiz or related questions:', error);
      throw error;
    }
  },

// <<<<<<< HEAD
  // เพิ่มคำถามใหม่
  createQuestion: (quizId, questionData) => {
    return axios.post(`${baseUrl}/${quizId}/questions`, questionData); // เพิ่มคำถามในควิซ
  },

  // อัปเดตคำถาม
  updateQuestion: (quizId, questionId, questionData) => {
    return axios.put(`${baseUrl}/${quizId}/questions/${questionId}`, questionData); // อัปเดตคำถาม
  },

  // ลบคำถาม
  deleteQuestion: (quizId, questionId) => {
    return axios.delete(`${baseUrl}/${quizId}/questions/${questionId}`); // ลบคำถามจากควิซ
  },

  submitResult: (resultData) => {
    return axios.post(`${baseUrl}/submitResult`, resultData, {
      headers: { "Content-Type": "application/json" },
    });
  },
  

  getQuizResults: (studentId) => {
    return axios.get(`${baseUrl}/results/${studentId}`);
  },

  

// =======
//   // Question services
//   getQuestionsByQuizId: (quizId) =>
//     axios.get(`/api/quiz/${quizId}/questions`), // ดึงคำถามทั้งหมดในควิซ
//   getQuestionById: (quizId, questionId) =>
//     axios.get(`/api/quiz/${quizId}/questions/${questionId}`), // ดึงคำถามตาม ID
//   createQuestion: (quizId, questionData) =>
//     axios.post(`/api/quiz/${quizId}/questions`, questionData), // เพิ่มคำถาม
//   updateQuestion: (quizId, questionId, questionData) =>
//     axios.put(`/api/quiz/${quizId}/questions/${questionId}`, questionData), // อัปเดตคำถาม
//   deleteQuestion: (quizId, questionId) =>
//     axios.delete(`/api/quiz/${quizId}/questions/${questionId}`), // ลบคำถาม
// >>>>>>> 17e3e66933ba71d74a2e3eb14960d1a5350d1d3a
};

export default quizService;
