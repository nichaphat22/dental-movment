const express = require("express")
const { 
    addLecture, 
    getLectures,
    deleteLecture} = require("../Controllers/lectureController")
const router = express.Router();

router.post("/", addLecture);
router.get("/:userLectureID", getLectures);
router.delete('/lectures/:id', deleteLecture);

module.exports = router;