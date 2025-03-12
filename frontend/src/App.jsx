// import { Routes, Route, Navigate } from "react-router-dom"
import { BrowserRouter as Router, Routes, Route,useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect, useContext } from "react";

// import 
import Chat from "./page/Chat"
import Login from "./page/Login"
import Register from "./page/Register"
import Home from './page/Home';

import { Container } from "react-bootstrap"
import NavBar from "./components/navbar/NavBar"
import HomeTeacher from "./page/HomeTeacher"
import HomeStudent from "./page/HomeStudent"
import { AuthContext } from "./context/AuthContext"
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



// import HomeS from "./page/home/homeStudent/homeS";
import Success from "./page/loginSuccess/success";
// import Dashboard from './page/home/homeStudent/Dashboard';
import DashboardStudent from './page/home/homeStudent/DashboardStudent';
import DashboardTeacher from './page/home/homeTeacher/DashboardTeacher';
// import Edit_MovementOfRPD from "./components/lesson/MovementOfRPD/Edit_MovementOfRPD"
import Form from "./page/Form"
import PageNotFound from './page/PageNotFound';
import GoogleLoginButton from "./components/GoogleLoginButton";

//----------------------------------------End------------------------------------------//


function App () {
  const { user } = useContext(AuthContext); // Fetch user data from context
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();



  return (
  <GoogleOAuthProvider>
    <ChatContextProvider user={user}>
    {location.pathname !== "/AR-RPD" && <NavBar />}

      {/* <NavBar /> */}

      <Container className="text-secondary">
        
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/googleLogin" element={<GoogleLoginButton/>}/>
        
          <Route path="/register" element={user ? <Chat /> :<Register />} />
          <Route path="/login" element={user ? <Chat /> : <Login />} />
          <Route path="/lectureHistory" element={user ? <LectureHistory/> : <Login />}></Route>
          <Route path="/bookmark" element={user ? <Bookmark /> : <Login />} />
          <Route path="/chat/:id" element={user ? <Chat /> : <Login />} />
          <Route path="/AR-RPD" element={user ? <ARModel /> : <Login />} />

          {user && user.role === 'teacher' && (
            <>
              <Route path='/teacher-dashboard' element={<DashboardTeacher/>}/>
              <Route path="/lesson" element={user ?<HomeTeacher /> : <Login />}/>
              <Route path="/Edit-RPD/:id/edit" element={user ? <EditRPDSampleCase /> : <Login />} />
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
            </>
          )}

          {user && user.role === 'student' && (
            <>
              <Route path='/student-dashboard' element={<DashboardStudent/>}/>
              <Route path="/lesson" element={user ? <HomeStudent />: <Login />} />
              <Route path="/ListQuiz" element={user ? <ListQuiz/>: <Login />}/>
              <Route path='/Quiz/:id/start' element={user ? <QuizStart/> : <Login/>}/>
              <Route path='/Quiz/:id' element={user ? <QuizDetail/> : <Login/>}/>
              <Route path="/bookmark" element={user ? <Bookmark /> : <Login />} />
              <Route path="/Model/:name/view" element={user ? <Model /> : <Login />} />
              <Route path="/animation/view/:id" element={user ? <ViewBiomechanicalConsideration /> : <Login />} />
              <Route path="/Biomechanical-consideration" element={user ? <BiomechanicalConsiderationStudent /> : <Login />} />
              <Route path="/animation3d/:name/view" element={user ? <ViewMovementOfRPD /> : <Login />} />
              <Route path="/Possible-Movement-Of-RPD" element={user ? <PossibleMovementOfRPDStudent/> : <Login/>}/>
              <Route path="/MovementOfRPD" element={user ? <MovementOfRPDStudent /> : <Login />} />
            </>
            
          )}
              {/* Fallback for undefined routes */}
              <Route path="*" element={<PageNotFound />} />

          </Routes>
          {/* ToastContainer สำหรับแสดงข้อความแจ้งเตือน */}
          
      </Container>

  
    </ChatContextProvider>
  </GoogleOAuthProvider>
  )
}

export default App
