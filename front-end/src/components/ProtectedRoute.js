import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRoles }) => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles && !requiredRoles.includes(userType)) {
        return <Navigate to={`/${userType}-workspace`} replace />;
    }

    return children;
};

export default ProtectedRoute;
