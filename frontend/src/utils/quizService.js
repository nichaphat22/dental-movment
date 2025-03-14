import axios from "axios";

// const BASE_URL = "http://localhost:8080/api/quiz";

const quizService = {
  getAllQuiz: () => axios.get(`/api/quiz/`), // ดึงควิซทั้งหมด
  getQuizById: (id) => axios.get(`/api/quiz/${id}`), // ดึงควิซตาม ID
  createQuiz: (quizData) => axios.post(`/api/quiz/addQuiz`, quizData), // สร้างควิซใหม่
  updateQuiz: async (id, quizData) => {
    try {
      // อัปเดตควิซ
      const updatedQuiz = await axios.put(`/api/quiz/${id}`, quizData);
      
      // หากมีการอัปเดตคำถามในควิซ
      if (quizData.questions) {
        // ลบคำถามที่ถูกลบในคำถามใหม่
        const currentQuestions = await axios.get(`/api/quiz/${id}/questions`);
        const currentQuestionIds = currentQuestions.data.map(q => q._id);

        const questionsToDelete = currentQuestionIds.filter(
          questionId => !quizData.questions.some(q => q._id === questionId)
        );

        for (const questionId of questionsToDelete) {
          await axios.delete(`/api/quiz/${id}/questions/${questionId}`);
        }

        // อัปเดตหรือเพิ่มคำถามใหม่
        for (const question of quizData.questions) {
          if (question._id) {
            // อัปเดตคำถามที่มีอยู่
            await axios.put(`/api/quiz/${id}/questions/${question._id}`, question);
          } else {
            // เพิ่มคำถามใหม่
            await axios.post(`/api/quiz/${id}/questions`, question);
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
      const response = await axios.get(`/api/quiz/${id}/questions`);
      const questions = response.data;
  
      // ลบคำถามที่เกี่ยวข้องทั้งหมด
      for (const question of questions) {
        await axios.delete(`/api/quiz/${id}/questions/${question._id}`);
      }
  
      // ลบควิซ
      return await axios.delete(`/api/quiz/${id}`);
    } catch (error) {
      // จัดการข้อผิดพลาดในการลบ
      console.error('Error deleting quiz or related questions:', error);
      throw error;  // ทำให้ error นี้ถูกโยนกลับไปที่ฝั่ง client
    }
  },

  // Question services
  getQuestionsByQuizId: (quizId) =>
    axios.get(`/api/quiz/${quizId}/questions`), // ดึงคำถามทั้งหมดในควิซ
  getQuestionById: (quizId, questionId) =>
    axios.get(`/api/quiz/${quizId}/questions/${questionId}`), // ดึงคำถามตาม ID
  createQuestion: (quizId, questionData) =>
    axios.post(`/api/quiz/${quizId}/questions`, questionData), // เพิ่มคำถาม
  updateQuestion: (quizId, questionId, questionData) =>
    axios.put(`/api/quiz/${quizId}/questions/${questionId}`, questionData), // อัปเดตคำถาม
  deleteQuestion: (quizId, questionId) =>
    axios.delete(`/api/quiz/${quizId}/questions/${questionId}`), // ลบคำถาม
};

export default quizService;
