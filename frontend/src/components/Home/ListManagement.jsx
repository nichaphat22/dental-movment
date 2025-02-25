import React, { useEffect, useState } from "react";
import quizService from "../../utils/quizService";
import { GoPeople, GoProjectRoadmap, GoVideo, GoDeviceDesktop } from "react-icons/go";
import { HiCubeTransparent } from "react-icons/hi2";
import { TbChartScatter3D } from "react-icons/tb";

const ListManagement = () => {
  const [quizzes, setQuizzes] = useState([]);

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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2 m-0 ">
      {/* student */}
      <div className="relative w-56 h-28 md:w-72 md:h-36 lg:w-64 lg:h-32 p-4 rounded-md shadow-md  border-b-4 border-green-500 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <GoPeople className="w-5 h-5 mr-4 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-lg">นักศึกษา</p>
          </div>
        </div>
        <div className="absolute bottom-1 right-4">
          <p className="text-sm md:text-base">Total</p>
        </div>
      </div>
      {/* Biomechanical consideration*/}
      <div className="relative w-56 h-28 md:w-72 md:h-36 lg:w-64 lg:h-32 p-4 rounded-md shadow-md  border-b-4 border-pink-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <GoDeviceDesktop className="w-5 h-5 mr-4 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-lg">Biomechanical consideration</p>
            <p className="text-xs md:text-sm">2D Animation</p>
          </div>
        </div>
        <div className="absolute bottom-1 right-4">
          <p className="text-sm md:text-base">Total</p>
        </div>
      </div>
      {/* Possible movement of RPD */}
      <div className="relative w-56 h-28 md:w-72 md:h-36 lg:w-64 lg:h-32 p-4 rounded-md shadow-md  border-b-4 border-blue-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <HiCubeTransparent className="w-5 h-5 mr-4 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-lg">Possible movement of RPD</p>
            <p className="text-xs md:text-sm">3D Model</p>
          </div>
        </div>
        <div className="absolute bottom-1 right-4">
          <p className="text-sm md:text-base">Total</p>
        </div>
      </div>
      {/* การเคลื่อนที่ของฟันเทียม */}
      <div className="relative w-56 h-28 md:w-72 md:h-36 lg:w-64 lg:h-32 p-4  rounded-md shadow-md  border-b-4 border-orange-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <GoVideo className="w-5 h-5 mr-4 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-lg">การเคลื่อนที่ของฟันเทียม</p>
            <p className="text-xs md:text-sm">3D Animation</p>
          </div>
        </div>
        <div className="absolute bottom-1 right-4">
          <p className="text-sm md:text-base">Total</p>
        </div>
      </div>
       {/* quiz */}
       <div className="relative w-56 h-28 md:w-72 md:h-36 lg:w-64 lg:h-32 p-4 rounded-md shadow-md  border-b-4 border-purple-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <GoProjectRoadmap className="w-5 h-5 mr-4 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-lg">แบบทดสอบ</p>
            {/* <p className="text-sm">AR</p> */}
          </div>
        </div>
        <div className="absolute bottom-1 right-4">
          <p className="text-sm md:text-base">Total {quizzes?.length || 0}</p>
        </div>
      </div>

      {/* View AR */}
      <div className="relative w-56 h-28 md:w-72 md:h-36 lg:w-64 lg:h-32 p-4 rounded-md shadow-md  border-b-4 border-yellow-400 hover:outline-hidden transition hover:-translate cursor-pointer duration-300 ease-in-out transform hover:scale-105">
        <div className="flex">
          <TbChartScatter3D className="w-5 h-5 mr-4 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-lg">View AR</p>
            <p className="text-xs md:text-sm">AR</p>
          </div>
        </div>
        <div className="absolute bottom-1 right-4">
          <p className="text-sm md:text-base">Total</p>
        </div>
      </div>

    </div>
  );
};

export default ListManagement;
