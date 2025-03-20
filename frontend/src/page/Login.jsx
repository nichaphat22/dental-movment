// import { useContext } from "react";
// import { Alert, Button, Form, Row, Col, Stack } from "react-bootstrap";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const { loginUser, loginError, loginInfo, updateLoginInfo, isLoginLoading } =
//     useContext(AuthContext);

//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault(); // ป้องกันการรีเฟรชของฟอร์ม

//     // เรียก loginUser และรอผลลัพธ์
//     const user = await loginUser(e);

//     if (user) {
//       if (user.role === "teacher") {
//         navigate("/dashboard");
//       } else if (user.role === "student") {
//         navigate("/dashboard");
//       }
//     }
//   };

//   return (
//     <>
//       <Row
//         style={{
//           height: "100vh",
//           justifyContent: "center",
//           paddingTop: "10%",
//         }}
//       >
//         <Col xs={6}>
//           <Stack gap={3}>
//             <h2>Login</h2>

//             <form onSubmit={handleLogin}> {/* เรียก handleLogin เมื่อ submit */}
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={loginInfo.email}
//                 onChange={(e) =>
//                   updateLoginInfo({ ...loginInfo, email: e.target.value })
//                 }
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={loginInfo.password}
//                 onChange={(e) =>
//                   updateLoginInfo({ ...loginInfo, password: e.target.value })
//                 }
//               />
//               <button type="submit">Login</button>
//             </form>
//           </Stack>
//         </Col>
//       </Row>
//     </>
//   );
// };

// export default Login;
