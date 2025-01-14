import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userTypeFromStorage = localStorage.getItem("userType");

        setIsAuthenticated(!!token); 
        setUserType(userTypeFromStorage); 
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
            localStorage.removeItem("username");

            setIsAuthenticated(false);
            setUserType(null);

            navigate("/login");
        }
    };

    return (
        <nav className="navbar">
            <ul>
                {!isAuthenticated && (
                    <>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        {userType === "student" && (
                            <>
                                <li>
                                    <Link to="/student-workspace">Student Workspace</Link>
                                </li>
                                <li>
                                    <Link to="/jury-projects">Jury Workspace</Link>
                                </li>
                                <li>
                                    <Link to="/create-team">Create Team</Link>
                                </li>
                            </>
                        )}
                        {userType === "professor" && (
                            <li>
                                <Link to="/professor-workspace">Professor Workspace</Link>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={handleLogout}
                                className="logout-button"
                            >
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
