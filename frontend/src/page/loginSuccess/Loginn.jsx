import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import { loginSuccess } from "../../redux/authSlice";
import { jwtDecode } from "jwt-decode";

const Loginn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token && typeof token === "string") {
      try {
        const decoded = jwtDecode(token);

        // ✅ ตรวจสอบ Token หมดอายุ
        if (decoded.exp * 1000 < Date.now()) {
          console.error("❌ Token expired");
          localStorage.removeItem("token"); // ✅ ลบ Token ที่หมดอายุ
          navigate("/"); // ✅ Redirect กลับไปหน้า Login
          return;
        }

        localStorage.setItem("token", token);
        dispatch(loginSuccess({ token, user: decoded })); // ✅ ใช้ { token, user } แทน token อย่างเดียว

        if (decoded.role === "teacher") {
          localStorage.setItem("teacherId", decoded._id);
          navigate("/dashboard-teacher");
        } else if (decoded.role === "student") {
          navigate("/dashboard-student");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Token decoding error:", error);
      }
    }
  }, [dispatch, navigate]); // ✅ เอา token ออกจาก dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token } = res.data;
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token received");
      }

      const decoded = jwtDecode(token);

      // ✅ ตรวจสอบ Token หมดอายุ
      if (decoded.exp * 1000 < Date.now()) {
        console.error("❌ Token expired");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      dispatch(loginSuccess({ token, user: decoded })); // ✅ ใช้ { token, user } แทน token อย่างเดียว

      if (decoded.role === "teacher") {
        localStorage.setItem("teacherId", decoded._id);
        navigate("/dashboard-teacher");
      } else if (decoded.role === "student") {
        navigate("/dashboard-student");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      setLoading(false); // ✅ ปิด loading เมื่อเกิด error
    }
  };

  return (
    <div className="mt-16">
      <h2>Login</h2>
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
