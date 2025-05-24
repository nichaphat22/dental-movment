// import { Routes, Route, Navigate } from "react-router-dom"
import { BrowserRouter as Router, Routes, Route,useLocation, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { API } from '../src/api/api';
// import { setUser } from './redux/authSlice';
import { loginSuccess } from './redux/authSlice';
// import { AuthContextProvider } from './context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// import 
import Chat from "./page/Chat"
// import Login from "./page/Login"
// import Register from "./page/Register"
import Login from "./page/loginSuccess/Loginn";
import Register from './page/loginSuccess/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './page/Home';

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
import ModelT from './page/Users/Teacherview/ModelT';
import ARModel from "./page/AR-RPD"
import BiomechanicalConsideration from "./page/BiomechanicalConsideration"
import AddBiomechanicalConsideration from "./page/AddBiomechanicalConsideration"
import ViewBiomechanicalConsideration from "./page/ViewBiomechanicalConsideration"
import BioemchanT from './page/Users/Teacherview/BioemchanT';
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

import MomentT from './page/Users/Teacherview/MomentT';


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

import Restorepage from './page/home/homeTeacher/Restorepage';
import Teacherpage from './page/home/homeTeacher/Teacherpage';

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
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(loginSuccess(token)); // ✅ โหลด Token จาก LocalStorage
    }
  }, [dispatch]);


  return (
<GoogleOAuthProvider clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}>
  
    <ChatContextProvider user={user}>
    {location.pathname !== "/AR-RPD" && <NavBar />}

      {/* <NavBar /> */}

      <Container className="text-secondary">
        
        <Routes>
        <Route 
          path="/" 
          element={
        user 
            ? (user.role === 'student' 
                ? <Navigate to="/dashboard-student" /> 
                : <Navigate to="/dashboard-teacher" />) 
            : <Login />
            } 
        />

        
          <Route path="/register" element={user ? <Chat /> :<Register />} />

          <Route path="/login" element={user ? <Navigate to="/"/>:<Login />} />
          {/* <Route path="/lectureHistory" element={user ? <LectureHistory/> : <Login />}></Route>
          <Route path="/bookmark" element={user ? <Bookmark /> : <Login />} /> */}
          <Route path="/chat/:id" element={user ? <Chat /> : <Login />} />
          <Route path="/AR-RPD" element={user ? <ARModel /> : <Login />} />

          <Route element={<ProtectedRoute allowedRoles={['teacher', 'student']}/>}>
              <Route path="/Model-teacher/:name/view" element={ <ModelT /> } />
              <Route path="/animation-teacher/view/:id" element={ <BioemchanT /> } />
              <Route path="/animation3d-teacher/:name/view" element={ <MomentT /> } />

               <Route path="/Model/:name/view" element={ <Model /> } />
              <Route path="/animation/view/:id" element={ <ViewBiomechanicalConsideration /> } />
              <Route path="/animation3d/:name/view" element={ <ViewMovementOfRPD /> } />

              <Route path="/Biomechanical-consideration" element={ <BiomechanicalConsiderationStudent /> } />
              <Route path="/Possible-Movement-Of-RPD" element={ <PossibleMovementOfRPDStudent/> }/>
              <Route path="/MovementOfRPD" element={ <MovementOfRPDStudent /> } />
          </Route>


          {/* Route สำหรับ Student */}
          <Route element={<ProtectedRoute allowedRoles={['student']}/>}>
              <Route path='/dashboard-student' element={<DashboardStudent/>}/>

              <Route path="/lesson-student" element={ <HomeStudent />} />

              

              <Route path="/ListQuiz-student" element={ <ListQuiz/>}/>
              <Route path='/Quiz/:id/start' element={ <QuizStart/> }/>
              <Route path='/quiz/:id/result' element={ <Result/>}/> 
              <Route path='/Quiz/:id' element={ <QuizDetail/> }/>

              <Route path="/bookmark-student" element={ <Bookmark /> } />
              <Route path="/lectureHistory-student" element={<LectureHistory/> } />
              
             
              {/* <Route path='/notification/' element={user? <NotificationBell/>: <Login/>}/> */}

          </Route>

          {/* Route สำหรับ Teacher */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']}/>}>
              <Route path='/dashboard-teacher' element={<DashboardTeacher/>}/>

              <Route path='/restore-teacher' element={<Restorepage/>}/>
              <Route path='/teacherPage' element={<Teacherpage/>}/>

              <Route path="/lesson-teacher" element={<HomeTeacher /> }/>

              <Route path="/Biomechanical-consideration-teacher" element={ <BiomechanicalConsideration /> } />
              <Route path="/Possible-Movement-Of-RPD-teacher" element={ <PossibleMovementOfRPDTeacher/> }/>
              <Route path="/MovementOfRPD-teacher" element={ <MovementOfRPD /> } />

              <Route path="/Add-RPD" element={ <AddRPDSampleCase /> } />
              <Route path="/Edit-RPD/:id/edit" element={ <EditRPDSampleCase /> } />
              <Route path="/Add-Biomechanical-consideration" element={ <AddBiomechanicalConsideration /> } />
              <Route path="/Edit-Biomechanical-consideration/:id" element={ <EditBiomechanicalConsideration /> } />
              <Route path="/Add-MovementOfRPD" element={ <AddMovementOfRPD /> } />
              <Route path="/Edit-MovementOfRPD/:name/edit" element={ <Edit_MovementOfRPD /> } />

              <Route path="/ListQuiz-teacher" element={ <QuizList/>}/>
              <Route path='/Add-Quiz' element={ <CreateQuizT/>}/>           
              <Route path='/quiz-teacher/:id' element={ <DetailQ/>}/> 
              <Route path='/quiz-teacher/:id/edit' element={ <EditQuiz/>}/> 

              <Route path="/bookmark-teacher" element={ <Bookmark /> } />
              <Route path="/lectureHistory-teacher" element={<LectureHistory/> } />
              <Route path="/Form" element={ <Form /> } />


              {/* <Route path='/notification/' element={user? <NotificationBell/>: <Login/>}/> */}
          </Route>

          
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
