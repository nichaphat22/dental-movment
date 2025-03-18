const express = require("express");
const { 
    loginUser, 
    findUser,
    getUsers,
    addTeacher,
    addStudent,
    getUserId,
    // registerUser,
    getStudents,
    updateProfile
} = require("../Controllers/userController");
// const {uploadedFile} = require("../Controllers/manageStudent");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.post("/addTeacher", addTeacher);
router.post("/addStudent", addStudent);
// router.post('/upload', uploadedFile)

router.get("/students", getStudents);
router.put("/updateProfile", verifyToken, updateProfile);

// router.post('/upload', uploadedFile)
router.get('/:userId', getUserId)


module.exports = router;
