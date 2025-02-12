import axios from "axios";

const BASE_URL = "http://localhost:8080/api/quiz";

const quizService = {
  getAllQuiz: () => axios.get(`${BASE_URL}/`), // ดึงควิซทั้งหมด
  getQuizById: (id) => axios.get(`${BASE_URL}/${id}`), // ดึงควิซตาม ID
  createQuiz: (quizData) => axios.post(`${BASE_URL}/addQuiz`, quizData), // สร้างควิซใหม่
  updateQuiz: async (id, quizData) => {
    try {
      // อัปเดตควิซ
      const updatedQuiz = await axios.put(`${BASE_URL}/${id}`, quizData);
      
      // หากมีการอัปเดตคำถามในควิซ
      if (quizData.questions) {
        // ลบคำถามที่ถูกลบในคำถามใหม่
        const currentQuestions = await axios.get(`${BASE_URL}/${id}/questions`);
        const currentQuestionIds = currentQuestions.data.map(q => q._id);

        const questionsToDelete = currentQuestionIds.filter(
          questionId => !quizData.questions.some(q => q._id === questionId)
        );

        for (const questionId of questionsToDelete) {
          await axios.delete(`${BASE_URL}/${id}/questions/${questionId}`);
        }

        // อัปเดตหรือเพิ่มคำถามใหม่
        for (const question of quizData.questions) {
          if (question._id) {
            // อัปเดตคำถามที่มีอยู่
            await axios.put(`${BASE_URL}/${id}/questions/${question._id}`, question);
          } else {
            // เพิ่มคำถามใหม่
            await axios.post(`${BASE_URL}/${id}/questions`, question);
          }
        }
      }

      return updatedQuiz;
    } catch (error) {
      console.error("Error updating quiz:", error);
      throw error;
    }
  }, // อัปเดตควิซ

  deleteQuiz: async (id) => {
    try {
      // เรียกดูคำถามที่เกี่ยวข้องกับควิซก่อนลบ
      const response = await axios.get(`${BASE_URL}/${id}/questions`);
      const questions = response.data;
  
      // ลบคำถามที่เกี่ยวข้องทั้งหมด
      for (const question of questions) {
        await axios.delete(`${BASE_URL}/${id}/questions/${question._id}`);
      }
  
      // ลบควิซ
      return await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting quiz or related questions:', error);
      throw error;
    }
  },

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
  },

  

  // Question services
  getQuestionsByQuizId: (quizId) => axios.get(`${BASE_URL}/${quizId}/questions`), // ดึงคำถามทั้งหมดในควิซ
  getQuestionById: (quizId, questionId) => axios.get(`${BASE_URL}/${quizId}/questions/${questionId}`), // ดึงคำถามตาม ID
  createQuestion: (quizId, questionData) => axios.post(`${BASE_URL}/${quizId}/questions`, questionData), // เพิ่มคำถาม
  updateQuestion: (quizId, questionId, questionData) => axios.put(`${BASE_URL}/${quizId}/questions/${questionId}`, questionData), // อัปเดตคำถาม
  deleteQuestion: (quizId, questionId) => axios.delete(`${BASE_URL}/${quizId}/questions/${questionId}`), // ลบคำถาม
};

export default quizService;
