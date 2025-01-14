import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function GradeProject() {
    const { projectId } = useParams();
    const [grade, setGrade] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/grade/${projectId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ gradeValue: grade }),
            });

            if (response.ok) {
                setMessage("Grade submitted successfully!");
                setError("");
                setTimeout(() => navigate("/jury-projects"), 2000);
            } else {
                const data = await response.json();
                setError(data.message || "Failed to submit grade.");
                setMessage("");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred. Please try again.");
            setMessage("");
        }
    };

    return (
        <div>
            <h2>Grade Project</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Grade (1-10):
                    <input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        min="1"
                        max="10"
                        required
                    />
                </label>
                <button type="submit">Submit Grade</button>
            </form>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default GradeProject;
