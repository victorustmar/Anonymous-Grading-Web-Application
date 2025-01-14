import React, { useEffect, useState } from "react";

function ProjectList() {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/projects");
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div>
            <h2>Grade</h2>
            <ul>
                {projects.map((project) => (
                    <li key={project.ProjectId}>
                        <strong>{project.Title}</strong> - Final Grade: {project.FinalGrade || "Not graded yet"}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProjectList;
