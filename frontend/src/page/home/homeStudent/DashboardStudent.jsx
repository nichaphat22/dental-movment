import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardStudent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);  // ปรับค่าเริ่มต้นเป็น null
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

 

    if (loading) {
        return <div>Loading...</div>;  // ถ้ากำลังโหลดให้แสดงข้อความนี้
    }

    if (errorMessage) {
        return <div style={{ color: 'red' }}>{errorMessage}</div>;  // หากเกิดข้อผิดพลาดให้แสดงข้อความนี้
    }

   

    return (
        <div>
            <h1>DashboardStudent</h1>
            <p>Welcome, {user?.name || "User"}!</p>  {/* หากข้อมูลผู้ใช้พร้อมแล้วให้แสดงชื่อ */}
            
        </div>
    );
};

export default DashboardStudent;
