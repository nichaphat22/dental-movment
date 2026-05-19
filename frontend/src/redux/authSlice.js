import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  roleData: null,
  img: null, // ✅ เพิ่มตัวแปรเก็บรูปโปรไฟล์
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // console.log("🔹 Redux setUser:", action.payload);

      if (!action.payload) {
        console.error("❌ No token provided!");
        return;
      }

      // ✅ กรณี Demo Mode — ส่งมาเป็น { token, user } object
      if (typeof action.payload === "object" && action.payload.user) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.roleData = null;
        state.img = action.payload.user.img || null;
        return;
      }

      try {
        const decodedToken = jwtDecode(action.payload);
        // console.log("🔹 Decoded token:", decodedToken); // ตรวจสอบข้อมูลใน Token

        // ✅ ตรวจสอบ Token หมดอายุ
        if (decodedToken.exp * 1000 < Date.now()) {
          console.error("❌ Token expired");
          return;
        }

        state.token = action.payload; // ✅ ย้ายมาหลังจากเช็ค Token หมดอายุแล้ว
        // localStorage.setItem("token", action.payload);

        if (decodedToken && decodedToken.id) {
          state.user = {
            _id: decodedToken.id,
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
          };
          state.roleData = decodedToken.roleData || null;
          state.img = decodedToken.img || null; // ✅ เพิ่มข้อมูลรูปโปรไฟล์
        } else {
          console.error("❌ Invalid token structure");
        }
      } catch (error) {
        console.error("❌ Error decoding token:", error);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roleData = null;
      state.img = null; // ✅ เคลียร์รูปโปรไฟล์เมื่อ logout
      localStorage.removeItem("token");
      localStorage.removeItem("teacherId");
      localStorage.removeItem("isDemoMode"); // ✅ เพิ่ม
      localStorage.removeItem("demoUser"); // ✅ เพิ่ม
    },
  },
});

export const { loginSuccess, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
