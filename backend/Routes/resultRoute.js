const express = require('express');
const router = express.Router();
const resultController = require("../Controllers/resultController");

// เส้นทางสำหรับการบันทึกคะแนน
router.post('/submitResult', resultController.submitResult);

// เส้นทางสำหรับการดึงผลคะแนนตาม quizId
router.get('/results/:quizId', resultController.getQuizScores);

module.exports = router;
