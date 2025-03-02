// import { Routes, Route, Navigate } from "react-router-dom"
import { BrowserRouter as Router, Routes, Route,useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { API } from '../src/api/api';
import { setUser } from './redux/authSlice';

// import 
import Chat from "./page/Chat"
// import Login from "./page/Login"
// import Register from "./page/Register"
import Login from "./page/loginSuccess/Loginn";
import Register from './page/loginSuccess/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './page/Home';
import "bootstrap/dist/css/bootstrap.min.css"
import { Container } from "react-bootstrap"
import NavBar from "./components/navbar/NavBar"
import HomeTeacher from "./page/HomeTeacher"
import HomeStudent from "./page/HomeStudent"
// import { AuthContext } from "./context/AuthContext"
import { ChatContextProvider } from "./context/ChatContext"
// import { ChatContextProvider } from "./context/ChatContext"
import EditRPDSampleCase from "./page/EditRPDSampleCase"
import AddRPDSampleCase from "./page/AddRPDSampleCase"
import Bookmark from "./page/Bookmark"
import Model from "./page/Model"
import ARModel from "./page/AR-RPD"
import BiomechanicalConsideration from "./page/BiomechanicalConsideration"
import AddBiomechanicalConsideration from "./page/AddBiomechanicalConsideration"
import ViewBiomechanicalConsideration from "./page/ViewBiomechanicalConsideration"
import EditBiomechanicalConsideration from "./page/EditBiomechanicalConsideration"
import BiomechanicalConsiderationStudent from "./page/BiomechanicalConsiderationStudent"
// import DrawModel from "./components/lesson/RPDSampleCase/DrawModel"
import LectureHistory from "./page/LectureHistoryImg"


//----------------------------------- route P---------------------------------------//
//Animation 3D
import AddMovementOfRPD from "./page/MovementOfRPD3D/Teacher3D/AddMovementOfRPD"
import MovementOfRPD from "./page/MovementOfRPD3D/Teacher3D/MovementOfRPD"
import PossibleMovementOfRPDTeacher from './page/MovementOfRPD3D/Teacher3D/PossibleMovementOfRPDTeacher';
import Edit_MovementOfRPD from "./page/MovementOfRPD3D/Teacher3D/EditMovementOfRPD"
import PossibleMovementOfRPDStudent from './page/MovementOfRPD3D/Student3D/PossibleMovementOfRPDStudent';
import MovementOfRPDStudent from "./page/MovementOfRPD3D/Student3D/MovementOfRPDStudent"
import ViewMovementOfRPD from "./page/MovementOfRPD3D/ViewMovementOfRPD"


//Quiz
import ListQuiz from './page/pageQuiz/StudentQuiz/ListQuiz';
import QuizStart from './page/pageQuiz/StudentQuiz/QuizStart';
import QuizDetail from './components/Quiz/Student/QuizDetail';
import QuizList from './page/pageQuiz/TeacherQuiz/QuizList';
import CreateQuizT from './page/pageQuiz/TeacherQuiz/CreateQuizT';
import DetailQ from './page/pageQuiz/TeacherQuiz/DetailQ';
import EditQuiz from './page/pageQuiz/TeacherQuiz/EditQuiz';
import Result from './page/pageQuiz/StudentQuiz/Result';
//Notification
// import NotificationBell from './components/Notification/NotificationBell';

// Dashboard
import DashboardStudent from './page/home/homeStudent/DashboardStudent';
import DashboardTeacher from './page/home/homeTeacher/DashboardTeacher';


// import HomeS from "./page/home/homeStudent/homeS";
import Success from "./page/loginSuccess/success";
// import Dashboard from './page/home/homeStudent/Dashboard';

// import Edit_MovementOfRPD from "./components/lesson/MovementOfRPD/Edit_MovementOfRPD"
import Form from "./page/Form"
import PageNotFound from './page/PageNotFound';
// import GoogleLoginButton from "./components/GoogleLoginButton";

//----------------------------------------End------------------------------------------//


function App () {
  // const { user } = useContext(AuthContext); // Fetch user data from context
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            dispatch(setUser(null)); // Clear user
            return;
        }

        try {
            const res = await API.get('api/auth/user', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            dispatch(setUser(res.data));
        } catch (error) {
            console.error("Failed to fetch user:", error);
            localStorage.removeItem("token");
            dispatch(setUser(null));
            window.location.href = "/login"; // Redirect
        }
    };
    fetchUser();
}, [dispatch]);


  return (
<GoogleOAuthProvider clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}>
  
    <ChatContextProvider user={user}>
    {location.pathname !== "/AR-RPD" && <NavBar />}

      {/* <NavBar /> */}

      <Container className="text-secondary">
        <Routes>
          <Route path="/" element={user ?<Home/>: <Login />}/>
        
          <Route path="/register" element={user ? <Chat /> :<Register />} />
          <Route path="/login" element={user ? <Navigate to="/"/>:<Login />} />
          <Route path="/lectureHistory" element={user ? <LectureHistory/> : <Login />}></Route>
          <Route path="/bookmark" element={user ? <Bookmark /> : <Login />} />
          <Route path="/chat" element={user ? <Chat /> : <Login />} />
          <Route path="/AR-RPD" element={user ? <ARModel /> : <Login />} />

          {/* Route สำหรับ Student */}
          <Route element={<ProtectedRoute allowedRoles={['student']}/>}>
              <Route path='/student-dashboard' element={<DashboardStudent/>}/>
              <Route path="/lesson" element={ <HomeStudent />} />
              <Route path="/ListQuiz" element={ <ListQuiz/>}/>
              <Route path='/Quiz/:id/start' element={ <QuizStart/> }/>
              <Route path='/quiz/:id/result' element={ <Result/>}/> 

              <Route path='/Quiz/:id' element={ <QuizDetail/> }/>
              <Route path="/bookmark" element={ <Bookmark /> } />
              <Route path="/Model/:name/view" element={ <Model /> } />
              <Route path="/animation/view/:id" element={ <ViewBiomechanicalConsideration /> } />
              <Route path="/Biomechanical-consideration" element={ <BiomechanicalConsiderationStudent /> } />
              <Route path="/animation3d/:name/view" element={ <ViewMovementOfRPD /> } />
              <Route path="/Possible-Movement-Of-RPD" element={ <PossibleMovementOfRPDStudent/> }/>
              <Route path="/MovementOfRPD" element={ <MovementOfRPDStudent /> } />
              {/* <Route path='/notification/' element={user? <NotificationBell/>: <Login/>}/> */}

          </Route>

          {/* Route สำหรับ Teacher */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']}/>}>
              <Route path='/teacher-dashboard' element={<DashboardTeacher/>}/>
              <Route path="/lesson" element={<HomeTeacher /> }/>
              <Route path="/Edit-RPD/:name/edit" element={ <EditRPDSampleCase /> } />
              <Route path="/Add-RPD" element={ <AddRPDSampleCase /> } />
              <Route path="/bookmark" element={ <Bookmark /> } />
              <Route path="/Model/:name/view" element={ <Model /> } />
              <Route path="/animation/view/:id" element={ <ViewBiomechanicalConsideration /> } />
              <Route path="/Edit-Biomechanical-consideration/:id" element={ <EditBiomechanicalConsideration /> } />
              <Route path="/Biomechanical-consideration" element={ <BiomechanicalConsideration /> } />
              <Route path="/Add-Biomechanical-consideration" element={ <AddBiomechanicalConsideration /> } />
              <Route path="/Edit-MovementOfRPD/:name/edit" element={ <Edit_MovementOfRPD /> } />
              <Route path="/Possible-Movement-Of-RPD" element={ <PossibleMovementOfRPDTeacher/> }/>
              <Route path="/MovementOfRPD" element={ <MovementOfRPD /> } />
              <Route path="/Add-MovementOfRPD" element={ <AddMovementOfRPD /> } />
              <Route path="/animation3d/:name/view" element={ <ViewMovementOfRPD /> } />
              <Route path="/Form" element={ <Form /> } />
              <Route path="/ListQuiz" element={ <QuizList/>}/>
              <Route path='/Add-Quiz' element={ <CreateQuizT/>}/> 
              <Route path='/quiz/:id' element={ <DetailQ/>}/> 
              <Route path='/quiz/:id/edit' element={ <EditQuiz/>}/> 
              {/* <Route path='/notification/' element={user? <NotificationBell/>: <Login/>}/> */}
          </Route>
{/* 
          {user && user.role === 'teacher' && (
            <>
              <Route path='/dashboard' element={<DashboardTeacher/>: <Login />}/>
              <Route path="/lesson" element={<HomeTeacher /> : <Login />}/>
              <Route path="/Edit-RPD/:name/edit" element={user ? <EditRPDSampleCase /> : <Login />} />
              <Route path="/Add-RPD" element={user ? <AddRPDSampleCase /> : <Login />} />
              <Route path="/bookmark" element={user ? <Bookmark /> : <Login />} />
              <Route path="/Model/:name/view" element={user ? <Model /> : <Login />} />
              <Route path="/animation/view/:id" element={user ? <ViewBiomechanicalConsideration /> : <Login />} />
              <Route path="/Edit-Biomechanical-consideration/:id" element={user ? <EditBiomechanicalConsideration /> : <Login />} />
              <Route path="/Biomechanical-consideration" element={user ? <BiomechanicalConsideration /> : <Login />} />
              <Route path="/Add-Biomechanical-consideration" element={user ? <AddBiomechanicalConsideration /> : <Login />} />
              <Route path="/Edit-MovementOfRPD/:name/edit" element={user ? <Edit_MovementOfRPD /> : <Login />} />
              <Route path="/Possible-Movement-Of-RPD" element={user ? <PossibleMovementOfRPDTeacher/> : <Login/>}/>
              <Route path="/MovementOfRPD" element={user ? <MovementOfRPD /> : <Login />} />
              <Route path="/Add-MovementOfRPD" element={user ? <AddMovementOfRPD /> : <Login />} />
              <Route path="/animation3d/:name/view" element={user ? <ViewMovementOfRPD /> : <Login />} />
              <Route path="/Form" element={user ? <Form /> : <Login />} />
              <Route path="/ListQuiz" element={user ? <QuizList/>: <Login />}/>
              <Route path='/Add-Quiz' element={user? <CreateQuizT/>: <Login/>}/> 
              <Route path='/quiz/:id' element={user? <DetailQ/>: <Login/>}/> 
              <Route path='/quiz/:id/edit' element={user? <EditQuiz/>: <Login/>}/> 
              <Route path='/notification/' element={user? <NotificationBell/>: <Login/>}/>

            </>
          )}

          {user && user.role === 'student' && (
            <>
              <Route path='/dashboard' element={user ?<DashboardStudent/>: <Login />}/>
              <Route path="/lesson" element={user ? <HomeStudent />: <Login />} />
              <Route path="/ListQuiz" element={user ? <ListQuiz/>: <Login />}/>
              <Route path='/Quiz/:id/start' element={user ? <QuizStart/> : <Login/>}/>
              <Route path='/quiz/:id/result' element={user? <Result/>: <Login/>}/> 

              <Route path='/Quiz/:id' element={user ? <QuizDetail/> : <Login/>}/>
              <Route path="/bookmark" element={user ? <Bookmark /> : <Login />} />
              <Route path="/Model/:name/view" element={user ? <Model /> : <Login />} />
              <Route path="/animation/view/:id" element={user ? <ViewBiomechanicalConsideration /> : <Login />} />
              <Route path="/Biomechanical-consideration" element={user ? <BiomechanicalConsiderationStudent /> : <Login />} />
              <Route path="/animation3d/:name/view" element={user ? <ViewMovementOfRPD /> : <Login />} />
              <Route path="/Possible-Movement-Of-RPD" element={user ? <PossibleMovementOfRPDStudent/> : <Login/>}/>
              <Route path="/MovementOfRPD" element={user ? <MovementOfRPDStudent /> : <Login />} />
              <Route path='/notification/' element={user? <NotificationBell/>: <Login/>}/>
            </>
            
          )} */}
              {/* Fallback for undefined routes */}
              <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
          {/* ToastContainer สำหรับแสดงข้อความแจ้งเตือน */}
          
      </Container>

  
    </ChatContextProvider>
    </GoogleOAuthProvider>
  
  )
}

export default App
