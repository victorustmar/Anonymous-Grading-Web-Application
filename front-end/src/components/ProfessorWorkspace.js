import React, { useEffect, useState } from "react";
import "./ProfessorWorkspace.css";

function ProfessorWorkspace() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/professor-projects", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch projects.");
                }

                const data = await response.json();
                setProjects(data);
            } catch (err) {
                console.error("Error fetching professor projects:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div>
            <h1>Professor Workspace</h1>
            {loading && <p>Loading projects...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && projects.length === 0 && <p>No projects with exactly 3 grades found.</p>}
            {!loading && projects.length > 0 && (
                <ul>
                    {projects.map((project, index) => (
                        <li key={index}>
                            <strong>{project.title}</strong> (Team: {project.teamName})
                            <br />
                            <strong>Team Members:</strong> {project.members.join(", ")}
                            <br />
                            <strong>Mean Grade:</strong> {project.meanGrade}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProfessorWorkspace;
