import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
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

const ListManagement = () => {
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [animations, setAnimations] = useState([]);
  const [models, setModels] = useState([]);
  const [modelCount, setModelCount] = useState(0);
  const [animation3ds, setAnimation3ds] = useState([]);
  const [animation3dCount, setAnimation3dCount] = useState(0);

  useEffect(() => {
    const fecthAll = async () => {
      try {
        const [studentRes, quizRes, animRes, anim3dRes, modelRes] = await Promise.all([
          axios.get(`${baseUrl}/auth/students`),
          quizService.getAllQuiz(),
          axios.get(`${baseUrl}/animation/getAnimation`),
          axios.get(`${baseUrl}/animation3D/animations`),
          axios.get(`${baseUrl}/model`),
        ]);
        setStudents(studentRes.data || []);
        setQuizzes(quizRes.data?.quiz || []);
        setAnimations(animRes.data || []);
        setAnimation3ds(anim3dRes.data || []);
        setAnimation3dCount(anim3dRes.data?.length || 0);

        setModels(modelRes.data || []);
        setModelCount(modelRes.data?.length || 0);
      } catch (error) {
        console.error("Init fetch failed:", error);
      }
    };

    fecthAll();

    // Socket listeners
    socket.on("studentUpdated", (data) => {
      setStudents(data);
    });

    socket.on("studentDeleted", (deletedId) => {
      setStudents((prev) =>
        prev.filter((student) => student._id !== deletedId)
      );
    });

    socket.on("studentsDeleted", (deletedIds) => {
      setStudents((prev) => prev.filter((s) => !deletedIds.includes(s._id)));
    });

    socket.on("animationUpdated", (data) => {
      setAnimations(data);
    });

    socket.on("quizUpdated", (data) => {
      setQuizzes(data);
    });

    socket.on("animation3dUpdated", (data) => {
      setAnimation3ds(data);
      setAnimation3dCount(data.length);
    });

    // 🟢 Model events
    socket.on("modelUpdated", (data) => {
      setModels(data);
      setModelCount(data.length);
    });

    socket.on("modelDeleted", (deletedId) => {
      setModels((prev) => {
        const updated = prev.filter((m) => m._id !== deletedId);
        setModelCount(updated.length);
        return updated;
      });
    });

    return () => {
      // unsubscribeModels();
      socket.off("studentUpdated");
      socket.off("quizUpdated");
      socket.off("animationUpdated");
      socket.off("animation3dUpdated");
      socket.off("studentDeleted");
      socket.off("studentsDeleted");
      socket.off("modelUpdated");
      socket.off("modelDeleted");
    };
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
              {animations?.length || 0}
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
            <p className="text-4xl text-orange-400 mb-2">{animation3dCount}</p>
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
            <p className="text-xs md:text-xs">View AR</p>
            <p className="text-xs md:text-xs">AR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListManagement;
