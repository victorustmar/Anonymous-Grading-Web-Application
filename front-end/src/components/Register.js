import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css"; 

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        userType: "student",
    });
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        setErrorMessage("");
    
        if (!formData.email.includes("@")) {
            setErrorMessage("Invalid email address. Please include '@' in your email.");
            return false; 
        }
    
        try {
            const response = await fetch("http://localhost:8000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                alert("Registration successful!");
                window.location.href = "/login";
            } else {
                const errorData = await response.json();
    
                if (response.status === 409) {
                    setErrorMessage(errorData.message);
                } else {
                    setErrorMessage(`Registration failed: ${errorData.message}`);
                }
                return false; 
            }
        } catch (error) {
            console.error("Error during registration:", error);
            setErrorMessage("An error occurred. Please try again.");
            return false; 
        }
    };
    

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
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
                <br />
                <label>
                    Role:
                    <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                    >
                        <option value="student">Student</option>
                        <option value="professor">Professor</option>
                    </select>
                </label>
                <br />
                <button type="submit">Register</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default Register;