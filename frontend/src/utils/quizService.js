import axios from "axios";

const BASE_URL = "http://localhost:8080/api/quiz";

const quizService = {
  getAllQuiz: () => axios.get(`${BASE_URL}/`), // ดึงควิซทั้งหมด
  getQuizById: (id) => axios.get(`${BASE_URL}/${id}`), // ดึงควิซตาม ID
  createQuiz: (quizData) => axios.post(`${BASE_URL}/addQuiz`, quizData), // สร้างควิซใหม่
  updateQuiz: (id, quizData) => axios.put(`${BASE_URL}/${id}`, quizData),


  deleteQuiz: async (id) => {
    try {
      // ลบควิซ
      return await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting quiz or related questions:', error);
      throw error;
    }
  },

  // เพิ่มคำถามใหม่
  createQuestion: (quizId, questionData) => {
    return axios.post(`${BASE_URL}/${quizId}/questions`, questionData); // เพิ่มคำถามในควิซ
  },

  // อัปเดตคำถาม
  updateQuestion: (quizId, questionId, questionData) => {
    return axios.put(`${BASE_URL}/${quizId}/questions/${questionId}`, questionData); // อัปเดตคำถาม
  },

  // ลบคำถาม
  deleteQuestion: (quizId, questionId) => {
    return axios.delete(`${BASE_URL}/${quizId}/questions/${questionId}`); // ลบคำถามจากควิซ
  },

  submitResult: (resultData) => {
    return axios.post(`${BASE_URL}/submitResult`, resultData, {
      headers: { "Content-Type": "application/json" },
    });
  },
  

  getQuizResults: (studentId) => {
    return axios.get(`${BASE_URL}/results/${studentId}`);
  },

  

};

export default quizService;
