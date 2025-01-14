import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError("");
        setPasswordError("");

        try {
            const response = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("userType", data.user.userType);

                if (data.user.userType === "student") {
                    window.location.href = "/student-workspace";
                } else if (data.user.userType === "professor") {
                    window.location.href = "/professor-workspace";
                }
            } else {
                const errorData = await response.json();
                if (errorData.field === "email") {
                    setEmailError(errorData.message);
                } else if (errorData.field === "password") {
                    setPasswordError(errorData.message);
                }
            }
        } catch (error) {
            console.error("Error during login:", error);
            setEmailError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                {emailError && <p className="error-message">{emailError}</p>} 
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                {passwordError && <p className="error-message">{passwordError}</p>} 
                <br />
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default Login;
