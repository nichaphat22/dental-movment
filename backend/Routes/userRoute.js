const express = require("express");
const { 
    loginUser, 
    findUser,
    getUsers,
    addTeacher,
    addStudent,
    getStudents,
    updateProfile
} = require("../Controllers/userController");
const {uploadedFile} = require("../Controllers/manageStudent");
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { verifyToken } = require("../middleware/authMiddleware");


const router = express.Router();

// router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get("/google-login", googleLogin);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.post("/addTeacher", addTeacher);
router.post("/addStudent", addStudent);
router.post('/upload', uploadedFile)

router.get("/students", getStudents);
router.put("/updateProfile", verifyToken, updateProfile);



module.exports = router;
