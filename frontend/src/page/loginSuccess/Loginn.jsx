import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api";
import { loginSuccess } from "../../redux/authSlice";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext"; // นำเข้า useAuth
import axios from "axios";
import { baseUrl } from "../../utils/services";
import { useCallback } from "react";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
// import imgHome from "../../../public/GroupHome.svg";
import imgHome from "../../assets/GroupHome.svg";
import { animate, motion } from "framer-motion";
import { Link } from "react-router-dom";

export const FadeUp = (delay) => {
  return {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

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

      const chatResponse = await axios.post(`${baseUrl}/chats`, {
        roleRef,
        id,
      });

      console.log("Create Chat Response:", chatResponse.data);

      if (chatResponse.data.message === "Chat already exists for student") {
        console.log("Chat already exists");
      } else {
        console.log("Chats created:", chatResponse.data.chats);
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
  // <div className="mt-16">
  //   <h2>Login</h2>
  //   {/* onSubmit={handleSubmit} */}
  //   <form >
  //     <input
  //       type="email"
  //       placeholder="Email"
  //       value={email}
  //       onChange={(e) => setEmail(e.target.value)}
  //       required
  //     />
  //     <input
  //       type="password"
  //       placeholder="Password"
  //       value={password}
  //       onChange={(e) => setPassword(e.target.value)}
  //       required
  //     />
  //     <button type="submit" disabled={loading}>
  //       {loading ? "Logging in..." : "Login"}
  //     </button>
  //   </form>

  // </div>

  return (
    <section className="border-none bg-white overflow-hidden relative">
      <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[650px]">
        {/* Brand Info */}
        <div
          className="flex flex-col justify-center
                    py-14 md:py-0 relative z-20"
        >
          <div className="pl-2 w-70% text-center md:text-left space-y-10 lg:text-left lg:max-w-[600px]">
            <motion.h1
              variants={FadeUp(0.6)}
              initial="initial"
              animate="animate"
              className=" text-purple-600 text-3xl lg:text-5xl font-bold
                            !leading-snug md:text-left"
            >
              BIOMECHANICS & POSSIBLE MOVEMENT
            </motion.h1>

            <motion.div
              variants={FadeUp(0.8)}
              initial="initial"
              animate="animate"
              className="flex justify-center md:justify-start
                            "
            >
              <a href="/api/auth/google">
                <button>Login with Google</button>
              </a>

              <HiOutlineArrowLongRight
                className="text-xl group-hover:translate-x-2
                            group-hover:-rotate-45 duration-300"
              />
            </motion.div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hidden md:flex justify-center items-center ">
          <motion.img
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
            src={imgHome}
            alt="imgDental"
            className="w-[300px] xl:w-[450px] relative z-10 drop-shadow"
          />
        </div>
      </div>
    </section>
  );
};

export default Loginn;
