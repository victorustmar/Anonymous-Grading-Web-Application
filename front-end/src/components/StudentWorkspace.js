import React, { useState, useEffect } from "react";
import axios from "axios";
import AddProject from "./AddProject";
import "./StudentWorkspace.css";

function StudentWorkspace() {
    const [team, setTeam] = useState(null);
    const [grades, setGrades] = useState([]);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTeamAndData = async () => {
            try {
                const teamResponse = await axios.get("http://localhost:8000/api/teams/student", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setTeam(teamResponse.data);

                if (teamResponse.data.TeamName) {
                    const gradesResponse = await axios.get(
                        `http://localhost:8000/api/grades/${teamResponse.data.TeamName}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    setGrades(gradesResponse.data);

                    const projectsResponse = await axios.get(
                        `http://localhost:8000/api/projects/team/${teamResponse.data.TeamName}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    setProjects(projectsResponse.data);
                }
            } catch (err) {
                console.error("Error fetching team data:", err);
                setError(err.response?.data?.message || "Failed to fetch team data.");
            }
        };

        fetchTeamAndData();
    }, []);

    return (
        <div className="student-workspace-container">
            <h1>Student Workspace</h1>

            <div className="team-section">
                <h2>My Team</h2>
                {team ? (
                    <div>
                        <h3>Team Name: {team.TeamName}</h3>
                        <h4>Members:</h4>
                        <ul className="team-members-list">
                            {team.Students.map((student) => (
                                <li key={student.StudentId}>{student.User.Username}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="error-message">{error || "You are not part of any team."}</p>
                )}
            </div>

            <hr />

            <div className="add-project-section">
                <AddProject teamName={team?.TeamName} />
            </div>

            <hr />

            <div className="projects-section">
                <h2>Team Projects</h2>
                {projects.length > 0 ? (
                    <ul>
                        {projects.map((project) => (
                            <li key={project.ProjectId}>
                                <strong>{project.Title}</strong> - {project.Description}
                                {project.Link && (
                                    <div>
                                        <a href={project.Link} target="_blank" rel="noopener noreferrer">
                                            View Project
                                        </a>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No projects have been created yet.</p>
                )}
            </div>

            <hr />

            <div className="grades-section">
                <h2>Grade Received</h2>
                {grades.length > 0 ? (
                    <ul>
                        {grades.map((grade, index) => (
                            <li key={index}>
                                <strong>Project:</strong> {grade.ProjectTitle} - <strong>Mean Grade:</strong> {grade.MeanGrade}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No projects with exactly 3 grades yet.</p>
                )}
            </div>
        </div>
    );
}

export default StudentWorkspace;
