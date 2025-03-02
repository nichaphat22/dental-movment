import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import { setUser } from "../../redux/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const Loginn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    console.log("Google login token:", token); // ✅ ตรวจสอบค่าที่ได้จาก Google OAuth

    if (token && typeof token === "string") {
      try {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        dispatch(setUser(decoded));

        if (decoded.role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (decoded.role === "student") {
          navigate("/student-dashboard");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Token decoding error:", error);
      }
    }
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login response:", res.data); // ✅ ตรวจสอบข้อมูลที่ได้รับจาก API

      const { token } = res.data;
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token received"); // ✅ ป้องกัน token ที่ไม่มีค่า
      }

      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      dispatch(setUser(decoded));

      if (decoded.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (decoded.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  return (
    <div className="mt-16">
      <h2>login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <a href="http://localhost:8080/api/auth/google">
        <button>Login with Google</button>
      </a>
    </div>
  );
};

export default Loginn;
