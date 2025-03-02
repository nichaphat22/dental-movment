import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
    const user = useSelector((state) => state.auth.user);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;  // ถ้า role ไม่ตรงให้กลับหน้าหลัก
    }

    return <Outlet />;
};

export default ProtectedRoute;
