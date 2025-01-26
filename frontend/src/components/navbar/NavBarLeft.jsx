import React from "react";
import { Link } from "react-router-dom";
import '../../tailwind.css';

const NavBarLeft = () => {
  return (
    <nav className="fixed top-16 left-0 h-full bg-white shadow-sm p-4 md:w-64 w-52">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-gray-500 pb-3 mb-3">
        BIOMECHANICS & POSSIBLE MOVEMENT
      </h2>

      {/* Links Section */}
      <div className="flex flex-col space-y-6">
        <Link
          to="/Biomechanical-consideration"
          className="text-gray-800 hover:text-purple-600 transition duration-300 focus:text-purple-600 text-sm md:text-base"
        >
          Biomechanical consideration
        </Link>
        <Link
          to="/Possible-Movement-Of-RPD"
          className="text-gray-800 hover:text-purple-600 transition duration-300 focus:text-purple-600 text-sm md:text-base"
        >
          Possible movement of RPD
        </Link>
        <Link
          to="/MovementOfRPD"
          className="text-gray-800 hover:text-purple-600 transition duration-300 focus:text-purple-600 text-sm md:text-base"
        >
          การเคลื่อนที่ของฟันเทียม
        </Link>
        <Link
          to="/Possible-Movement-Of-RPD"
          className="text-gray-800 hover:text-purple-600 transition duration-300 focus:text-purple-600 text-sm md:text-base"
        >
          RPD sample case
        </Link>
        <Link
          to="/AR-RPD"
          className="text-gray-800 hover:text-purple-600 transition duration-300 focus:text-purple-600 text-sm md:text-base"
        >
          View AR
        </Link>
      </div>
    </nav>
  );
};

export default NavBarLeft;
