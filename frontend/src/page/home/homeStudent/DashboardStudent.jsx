import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardStudent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);  // ปรับค่าเริ่มต้นเป็น null
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchUser = async (token) => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/profile", {
                headers: {
                    'Authorization': `Bearer ${token}`,  // ส่ง Bearer token ไปใน header
                    'Content-Type': 'application/json',
                },
                method: 'GET',
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Error:", error);
                setErrorMessage(error.error || "Failed to fetch user profile.");
                throw new Error(error.error || "Failed to fetch user");
            }

            const data = await res.json();
            setUser(data.user);  // หากไม่มีปัญหาจะเก็บข้อมูลผู้ใช้
        } catch (error) {
            console.error("Fetch error:", error);
            setErrorMessage("An error occurred. Please log in again.");
            navigate("/googleLogin");  // ถ้าไม่ได้รับการตอบรับจาก API ให้เปลี่ยนเส้นทางไปยังหน้า Login
        } finally {
            setLoading(false);
        }
    };

    const token = localStorage.getItem("token");  // ดึง token จาก localStorage

    useEffect(() => {
        if (token) {
            fetchUser(token);  // ถ้ามี token ก็ทำการ fetch ข้อมูลผู้ใช้
        } else {
            setErrorMessage("No token found, please log in.");
            navigate("/googleLogin");  // หากไม่มี token ให้เปลี่ยนเส้นทางไปยังหน้า Login
        }
    }, [navigate, token]);

    if (loading) {
        return <div>Loading...</div>;  // ถ้ากำลังโหลดให้แสดงข้อความนี้
    }

    if (errorMessage) {
        return <div style={{ color: 'red' }}>{errorMessage}</div>;  // หากเกิดข้อผิดพลาดให้แสดงข้อความนี้
    }

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");  // เมื่อออกจากระบบให้เปลี่ยนเส้นทางไปหน้าแรก
    };

    return (
        <div>
            <h1>DashboardStudent</h1>
            <p>Welcome, {user?.name || "User"}!</p>  {/* หากข้อมูลผู้ใช้พร้อมแล้วให้แสดงชื่อ */}
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default DashboardStudent;
