import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function JuryAssignedProjects() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProjectsFromStudentWorkspace = async () => {
            try {
                // Fetch projects from the student workspace endpoint
                const response = await axios.get("http://localhost:8000/api/projects", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.status === 200) {
                    setProjects(response.data);
                } else {
                    throw new Error("Failed to fetch projects from student workspace.");
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError(err.response?.data?.message || "Failed to fetch projects.");
            }
        };

        fetchProjectsFromStudentWorkspace();
    }, []);

    return (
        <div>
            <h2>Jury Workspace - Assigned Projects</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {projects.length > 0 ? (
                <ul>
                    {projects.map((project) => (
                        <li key={project.ProjectId}>
                            <strong>Title:</strong> {project.Title} <br />
                            <strong>Team:</strong> {project.TeamName} <br />
                            <strong>Description:</strong> {project.Description} <br />
                            {project.Link && (
                                <a href={project.Link} target="_blank" rel="noopener noreferrer">
                                    View Project
                                </a>
                            )}
                            <br />
                            <Link to={`/grade/${project.ProjectId}`}>Grade this Project</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No projects available for grading at the moment.</p>
            )}
        </div>
    );
}

export default JuryAssignedProjects;
