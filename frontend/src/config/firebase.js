import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';  // เพิ่มการนำเข้า Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyD_fEpGR83CLeYOzn-UiVQcfipx-wtMQZY",
  authDomain: "project-it-410215.firebaseapp.com",
  databaseURL: "https://project-it-410215-default-rtdb.asia-southeast1.firebasedatabase.app",  // URL ของ Realtime Database
  projectId: "project-it-410215",
  storageBucket: "project-it-410215.appspot.com",
  messagingSenderId: "466628742236",
  appId: "1:466628742236:web:be9892ea1c5f5b2ec12a99",
  measurementId: "G-X6JJL1HF6W"
};

// สร้าง Firebase App โดยใช้ initializeApp และ Firebase config
const app = initializeApp(firebaseConfig);

// สร้าง Firebase Storage และ Realtime Database โดยใช้ Firebase App ที่สร้างขึ้น
const storage = getStorage(app);
const database = getDatabase(app);  // เพิ่มการสร้าง Realtime Database

export { storage, database };
