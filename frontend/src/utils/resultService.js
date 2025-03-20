import axios from "axios";
import { baseUrl } from "./services";

// const BASE_URL = "http://localhost:8080/api/result";

const resultService = {
  // แก้ไขการกำหนดฟังก์ชัน
  submitResult: (userId, quizId, correctAnswers, totalQuestions) => {
    return axios.post(`${baseUrl}/result/submitResult`, {
      userId,
      quizId,
      correctAnswers,
      totalQuestions,
    });
  },

  getQuizScores: (quizId) => {
    return axios.get(`${baseUrl}/result/results/${quizId}`);  // ดึงคะแนนจาก API
  }

};

export default resultService;
