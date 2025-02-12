import axios from "axios";

const BASE_URL = "http://localhost:8080/api/result";

const resultService = {
  // แก้ไขการกำหนดฟังก์ชัน
  submitResult: (userId, quizId, correctAnswers, totalQuestions) => {
    return axios.post(`${BASE_URL}/submitResult`, {
      userId,
      quizId,
      correctAnswers,
      totalQuestions,
    });
  },

  getQuizScores: (quizId) => {
    return axios.get(`${BASE_URL}/results/${quizId}`);  // ดึงคะแนนจาก API
  }

};

export default resultService;
