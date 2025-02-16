import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JuryAssignedProjects.css";

function JuryAssignedProjects() {
    const [project, setProject] = useState(null);
    const [grade, setGrade] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRandomProject = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/jury/random-project", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setProject(response.data);
            } catch (err) {
                console.error("Error fetching random project:", err);
                setError(err.response?.data?.message || "Failed to fetch a project.");
            }
        };

        fetchRandomProject();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!grade || grade < 1 || grade > 10) {
            setError("Please enter a valid grade between 1 and 10.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/api/grade/${project.ProjectId}`,
                { gradeValue: grade },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.status === 201) {
                setMessage("Grade submitted successfully!");
                setGrade("");
                setProject(null);
            }
        } catch (err) {
            console.error("Error submitting grade:", err);
            setError(err.response?.data?.message || "Failed to submit grade.");
        }
    };

    return (
        <div className="jury-assigned-projects-container">
            <h1>Jury Assigned Projects</h1>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            {project ? (
                <div className="project-details">
                    <h2>{project.Title}</h2>
                    <p>{project.Description}</p>
                    {project.Link && (
                        <a href={project.Link} target="_blank" rel="noopener noreferrer">
                            View Project
                        </a>
                    )}
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
                </div>
            ) : (
                <p>Congratulations on grading the project! If you haven't, there is no project available for grading at the moment.</p>
            )}
        </div>
    );
}

export default JuryAssignedProjects;
