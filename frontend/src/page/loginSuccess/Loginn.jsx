import React, { useState, useEffect,useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import { loginSuccess } from "../../redux/authSlice";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";  // นำเข้า useAuth
import axios from 'axios';
import { baseUrl } from '../../utils/services';
import { useCallback } from 'react';
const Loginn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const {  } = useAuth();  // ใช้ฟังก์ชัน setUserData จาก context
  // const { user,setUser } = useContext(AuthContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
  
    if (token && typeof token === "string") {
      const fetchUserData = async () => {
        try {
          const decoded = jwtDecode(token);
          console.log("decoded:", decoded);
  
          if (decoded.exp * 1000 < Date.now()) {
            console.error("❌ Token expired");
            localStorage.removeItem("token");
            navigate("/");
            return;
          }
  
          localStorage.setItem("token", token);
          dispatch(loginSuccess({ token, user: decoded }));
  
          createChat({ decoded });
          console.log("decodeddecoded:", decoded);
  
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
      };
  
      fetchUserData();
    }
  }, [dispatch, navigate]);
  
  const createChat = useCallback(async ({ decoded }) => {
    try {
        const { roleRef, id } = decoded;

        if (!id) {
            console.error("User ID is missing!");
            return;
        }

        const chatResponse = await axios.post(`${baseUrl}/chats`, { roleRef, id });

        console.log("Create Chat Response:", chatResponse.data);

        if (chatResponse.data.message === 'Chat already exists for student') {
            console.log('Chat already exists');
        } else {
            console.log('Chats created:', chatResponse.data.chats);
        }
    } catch (error) {
        console.error("Error creating chat:", error);
    }
}, []);

  
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  
  //   try {
  //     const res = await API.post(
  //       `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
  //       { email, password },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  
  //     const { token } = res.data;
  //     if (!token || typeof token !== "string") {
  //       throw new Error("Invalid token received");
  //     }
  
  //     const decoded = jwtDecode(token);
  
  //     if (decoded.exp * 1000 < Date.now()) {
  //       console.error("❌ Token expired");
  //       setLoading(false);
  //       return;
  //     }
  
  //     localStorage.setItem("token", token);
  //     dispatch(loginSuccess({ token, user: decoded }));
  //     setUser(decoded);  // ส่งข้อมูลผู้ใช้ไปยัง context
  
  //     if (decoded.role === "teacher") {
  //       localStorage.setItem("teacherId", decoded._id);
  //       navigate("/dashboard-teacher");
  //     } else if (decoded.role === "student") {
  //       navigate("/dashboard-student");
  //     } else {
  //       navigate("/");
  //     }
     

  //   } catch (error) {
  //     console.error("Login Failed:", error.response?.data || error.message);
  //     setLoading(false);
  //   }
  // };
  

  return (
    <div className="mt-16">
    <h2>Login</h2>
    {/* onSubmit={handleSubmit} */}
    <form >
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

    <a href="https://backend-dental-production.up.railway.app/api/auth/google">
      <button>Login with Google</button>
    </a>
  </div>
  );
};

export default Loginn;
