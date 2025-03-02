require('dotenv').config();
const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const session = require('express-session');
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const animationRoute = require("./Routes/animationRoute");
const animation3DRoute = require("./Routes/animation3DRoute");
const lectureRoute = require("./Routes/lectureRoute");
const quizRoute = require("./Routes/quizRoute");
const notificationRoute = require("./Routes/notificationRoute");
const authRoute = require("./Routes/authRoute");
const bodyParser = require('body-parser');
const passport = require('./config/passport');




console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK:", process.env.GOOGLE_CALLBACK);


const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(express.json());



// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // ตั้งเป็น false ใน development
}));


app.use(passport.initialize());
app.use(passport.session());


// ใช้ express.json() และ cors
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// เพิ่ม Header สำหรับทุกเส้นทาง
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

//Router
app.get("/", (req, res) => {
  res.send("Welcome to the chat app API...");
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/animation", animationRoute);
app.use("/api/animation3D", animation3DRoute);
app.use("/api/lecture", lectureRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/notifications", notificationRoute);






const port = process.env.PORT || 8080;
const uri = process.env.DBURI;



mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("MongoDB connection established"))
    .catch((error) => console.log("MongoDB connection failed: ", error.message));
  
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
