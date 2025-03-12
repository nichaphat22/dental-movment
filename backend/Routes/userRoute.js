const express = require("express");
const { 
    loginUser, 
    findUser,
    getUsers,
    addTeacher,
    addStudent,
    getUserId
    ,registerUser
} = require("../Controllers/userController");
// const {uploadedFile} = require("../Controllers/manageStudent");
// const passport = require('../config/passport');
// const jwt = require('jsonwebtoken');
// const { OAuth2Client } = require("google-auth-library");
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get("/google-login", googleLogin);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.post("/addTeacher", addTeacher);
router.post("/addStudent", addStudent);
// router.post('/upload', uploadedFile)
router.get('/:userId', getUserId)
//Google login
//Redirect to Google Login
// router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

//handle Google callback
// router.get(
//     '/google/callback',
//     passport.authenticate('google', { failureRedirect: '/googleLogin' }),
//     (req, res) => {
//         try {
//             const token = jwt.sign(req.user, 'SECRET_KEY', { expiresIn: '1h' });
//             res.redirect(`http://localhost:5173/success?token=${token}`);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Failed to generate token' });
//         }
//     }
// );


//verify Google Token
// router.post('/google/token', async (req, res) => {
//     const { token } = req.body;

//     try {
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });

//         const payload = ticket.getPayload();
//         const user = {
//             googleId: payload.sub,
//             email: payload.email,
//             name: payload.name,
//         };

//         const jwtToken = jwt.sign(user, 'SECRET_KEY', {expiresIn: '1h'});
//         res.status(200).json({ token: jwtToken, user});
//     } catch (error) {
//         res.status(401).json({ error: 'Invalid Google Token'});
//     }
// });


module.exports = router;
