import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import '../../tailwind.css';
const SideNavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-md"
      >
        {isSidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 z-40`}
      >
        <div className="p-4">
          {/* <h2 className="text-2xl font-bold text-purple-600 mb-6">เมนูหลัก</h2> */}
          <nav className="flex flex-col space-y-4">
            <Link to="/Biomechanical-consideration" className="text-gray-800 hover:text-purple-600">บทเรียน</Link>
            <Link to="/" className="text-gray-800 hover:text-purple-600">แบบทดสอบ</Link>
            <Link to="/MovementOfRPD" className="text-gray-800 hover:text-purple-600">ประวัติการเลกเชอร์</Link>
            <Link to="/" className="text-gray-800 hover:text-purple-600">รายการโปรด</Link>
            <Link to="/AR-RPD" className="text-gray-800 hover:text-purple-600">เพิ่มรายชื่อนักศึกษา</Link>
          </nav>
        </div>
      </div>

      {/* Overlay (optional for dimming the rest of the screen) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar} // Close sidebar when clicking on the overlay
        />
      )}
    </>
  );
};

export default SideNavBar;
