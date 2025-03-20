import React, { useEffect, useState } from "react";
import quizService from "../../utils/quizService";
import {
  GoPeople,
  GoProjectRoadmap,
  GoVideo,
  GoDeviceDesktop,
} from "react-icons/go";
import { HiCubeTransparent } from "react-icons/hi2";
import { TbChartScatter3D } from "react-icons/tb";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseUrl } from "../../utils/services";
import { ref, get } from "firebase/database";
import { database } from "../../config/firebase";

const ListManagement = () => {
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [Animations, setAnimations] = useState([]);
  const [modelCount, setModelCount] = useState(0);
  const [animation3ds, setAnimation3ds] = useState(0);

  //get student
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${baseUrl}/auth/students`);
        setStudents(response.data); // ไม่ต้องดึง count
      } catch (error) {
        console.error("Failed to fetch students", error);
        setStudents([]);
      }
    };
    fetchStudents();
  }, []);


  //get quiz
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizService.getAllQuiz();

        if (response.data && Array.isArray(response.data.quiz)) {
          setQuizzes(response.data.quiz);
        } else {
          console.error("Expected an array but got", response.data);
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes", error);
        setQuizzes([]);
      }
    };
    fetchQuizzes();
  }, []);

  //get Animation 2D
  useEffect(() => {
    const fetchAnimation2D = async () => {
      try {
        const response = await axios.get(`${baseUrl}/animation/getAnimation`);
        setAnimations(response.data);
      } catch (error) {
        console.error("Failed to fetch Animation2D", error);
        setAnimations([]);
      }
    };
    fetchAnimation2D();
  }, []);

  //get model firebase
  useEffect(() => {
    const fetchModelCount = async () => {
      try {
        const modelsRef = ref(database, "models/");
        const snapshot = await get(modelsRef);

        if (snapshot.exists()) {
          const modelData = snapshot.val();
          setModelCount(Object.keys(modelData).length);
        } else {
          console.warn("No models found in database.");
        }
      } catch (error) {
        console.error("Error fetching model count:", error);
      }
    };
    fetchModelCount();
  }, []);

  //get animation3d firebase
  useEffect(() => {
    const fetchAnimation3dCount = async () => {
      try {
        const animation3dRef = ref(database, "animations/");
        const snapshot = await get(animation3dRef);

        if (snapshot.exists()) {
          const animation3dData = snapshot.val();
          setAnimation3ds(Object.keys(animation3dData).length);
        } else {
          console.warn("No animation3d found in database.");
        }
      } catch (error) {
        console.error("Error fetching animation3d count:", error);
      }
    };
    fetchAnimation3dCount();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2 m-0 ">
      {/* student */}
      <div className="relative w-56 h-32 md:w-72 md:h-36 lg:w-64 lg:h-32 p-3.5 rounded-md shadow-md  border-b-4 border-green-500 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <div className="w-12 h-12 mr-3 flex-shrink-0 rounded-full bg-green-300 flex items-center justify-center">
            <GoPeople className="w-7 h-7  text-white" />
          </div>

          <div>
            <p className="text-4xl text-green-500 mb-2">
              {students?.length || 0}
            </p>
            <p className="text-xs md:text-xs">นักศึกษา</p>
          </div>
        </div>
      </div>
      {/* Biomechanical consideration*/}
      <div className="relative w-56 h-32 md:w-72 md:h-36 lg:w-64 lg:h-32 p-3.5  rounded-md shadow-md  border-b-4 border-pink-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex ">
          <div className="w-12 h-12 mr-3 flex-shrink-0 rounded-full bg-pink-300 flex items-center justify-center">
            <GoDeviceDesktop className="w-7 h-7 text-white " />
          </div>
          <div>
            <p className="text-4xl text-pink-400 mb-2">
              {Animations?.length || 0}
            </p>
            <p className="text-xs md:text-xs">Biomechanical consideration</p>
            <p className="text-xs md:text-xs ">2D Animation</p>
          </div>
        </div>
      </div>
      {/* Possible movement of RPD */}
      <div className="relative w-56 h-32 md:w-72 md:h-36 lg:w-64 lg:h-32 p-3.5 rounded-md shadow-md  border-b-4 border-blue-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <div className="w-12 h-12 mr-3 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center">
          <HiCubeTransparent className="w-7 h-7 text-white" />

          </div>
          <div>
            <p className="text-4xl text-blue-400 mb-2">{modelCount}</p>
            <p className="text-xs md:text-xs">Possible movement of RPD</p>
            <p className="text-xs md:text-xs">3D Model</p>
          </div>
        </div>
      </div>
      {/* การเคลื่อนที่ของฟันเทียม */}
      <div className="relative w-56 h-32 md:w-72 md:h-36 lg:w-64 lg:h-32 p-3.5  rounded-md shadow-md  border-b-4 border-orange-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <div className="w-12 h-12 mr-3 flex-shrink-0 rounded-full bg-orange-300 flex items-center justify-center">
            <GoVideo className="w-7 h-7 text-white" />

          </div>
          <div>
            <p className="text-4xl text-orange-400 mb-2">{animation3ds}</p>
            <p className="text-xs md:text-xs">การเคลื่อนที่ของฟันเทียม</p>
            <p className="text-xs md:text-xs">3D Animation</p>
          </div>
        </div>
      </div>
      {/* quiz */}
      <div className="relative w-56 h-32 md:w-72 md:h-36 lg:w-64 lg:h-32 p-3.5 rounded-md shadow-md  border-b-4 border-purple-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <div className="w-12 h-12 mr-4 flex-shrink-0 rounded-full bg-purple-300 flex items-center justify-center">
          <GoProjectRoadmap className="w-7 h-7 text-white" />

          </div>
          <div>
            <p className="text-4xl text-purple-400 mb-2">
              {quizzes?.length || 0}
            </p>
            <p className="text-xs md:text-xs">แบบทดสอบ</p>
          </div>
        </div>
      </div>

      {/* View AR */}
      <div className="relative w-56 h-32 md:w-72 md:h-36 lg:w-64 lg:h-32 p-3.5 rounded-md shadow-md  border-b-4 border-yellow-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <div className="w-12 h-12 mr-3 flex-shrink-0 rounded-full bg-yellow-300 flex items-center justify-center">
          <TbChartScatter3D className="w-7 h-7 text-white" />

          </div>
          <div>
            <p className="text-4xl text-yellow-400 mb-2">{modelCount}</p>
            {/* <p className="text-xs md:text-xs">View AR</p> */}
            <p className="text-xs md:text-xs">AR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListManagement;
