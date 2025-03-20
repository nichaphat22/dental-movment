// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from "react";
import { useSelector } from 'react-redux';

// สร้าง context สำหรับข้อมูลผู้ใช้
export const AuthContext = createContext(); // Make sure it's exported

// custom hook เพื่อใช้ context
export const useAuth = () => {
  return useContext(AuthContext);
};

// สร้าง provider เพื่อแชร์ข้อมูลผู้ใช้
export const AuthContextProvider = ({ children }) => {
  // const [user, setUser] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const setUserData = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
