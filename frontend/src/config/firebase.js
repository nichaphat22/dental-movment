import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';  // เพิ่มการนำเข้า Realtime Database


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://project-it-410215-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// สร้าง Firebase App โดยใช้ initializeApp และ Firebase config
const app = initializeApp(firebaseConfig);

// สร้าง Firebase Storage และ Realtime Database โดยใช้ Firebase App ที่สร้างขึ้น
const storage = getStorage(app);
const database = getDatabase(app);  // เพิ่มการสร้าง Realtime Database

export { storage, database };
