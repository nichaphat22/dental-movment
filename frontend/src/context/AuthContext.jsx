import React, { createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const login = (newToken) => {
    dispatch(loginSuccess(newToken));
    navigate(user?.role === "teacher" ? "/dashboard-teacher" : "/dashboard-student");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
