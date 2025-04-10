import axios from "axios";
import { baseUrl } from "./services";

// const BASE_URL = "http://localhost:8080/api/quiz";

const quizService = {

  getAllQuiz: () => axios.get(`${baseUrl}/quiz/`), // ดึงควิซทั้งหมด
  getQuizById: (id) => axios.get(`${baseUrl}/quiz/${id}`), // ดึงควิซตาม ID
  createQuiz: (quizData) => axios.post(`${baseUrl}/quiz/addQuiz`, quizData), // สร้างควิซใหม่
  updateQuiz: (id, quizData) => axios.put(`${baseUrl}/quiz/${id}`, quizData),



  deleteQuiz: async (id) => {
    try {
      // ลบควิซ
      return await axios.delete(`${baseUrl}/quiz/${id}`);
    } catch (error) {
      console.error('Error deleting quiz or related questions:', error);
      throw error;
    }
  },


  // เพิ่มคำถามใหม่
  createQuestion: (quizId, questionData) => {
    return axios.post(`${baseUrl}/quiz/${quizId}/questions`, questionData); // เพิ่มคำถามในควิซ
  },

  // อัปเดตคำถาม
  updateQuestion: (quizId, questionId, questionData) => {
    return axios.put(`${baseUrl}/quiz/${quizId}/questions/${questionId}`, questionData); // อัปเดตคำถาม
  },

  // ลบคำถาม
  deleteQuestion: (quizId, questionId) => {
    return axios.delete(`${baseUrl}/quiz/${quizId}/questions/${questionId}`); // ลบคำถามจากควิซ
  },

  submitResult: (resultData) => {
    return axios.post(`${baseUrl}/quiz/submitResult`, resultData, {
      headers: { "Content-Type": "application/json" },
    });
  },
  

  getQuizResults: (studentId) => {
    return axios.get(`${baseUrl}/quiz/results/${studentId}`);
  },

  
};

export default quizService;
