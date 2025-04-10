import axios from "axios";

export const API = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
})


// // สร้าง instance ของ axios ที่ใช้ในการตั้งค่า default header สำหรับ Authorization
// export const API = axios.create({
//     baseURL: import.meta.env.VITE_APP_API_URL, // ใช้ environment variable สำหรับ base URL
//     withCredentials: true,
//   });
  
  // ตรวจสอบ token และเพิ่มลงใน header
  API.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );