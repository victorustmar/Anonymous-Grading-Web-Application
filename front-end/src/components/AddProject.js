import React, { useState } from "react";
import "./AddProject.css";

function AddProject({ teamName }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!title.trim() || !description.trim()) {
            setError("Title and Description are required.");
            return;
        }

        if (!teamName) {
            setError("You are not part of any team. Please join a team first.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/createproject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, link, teamName }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Project added successfully!");
                setTitle("");
                setDescription("");
                setLink("");
            } else {
                setError(data.message || "Failed to add project.");
            }
        } catch (error) {
            console.error("Error adding project:", error);
            setError("An error occurred while adding the project. Please try again.");
        }
    };

    return (
        <div className="add-project-container">
            <h2>Add Project</h2>
            <form className="add-project-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="team-name">Team Name</label>
                    <input
                        type="text"
                        id="team-name"
                        value={teamName || ""}
                        readOnly
                        placeholder="Your team name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="title">Project Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter project title"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Project Description</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter project description"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="link">Project Link</label>
                    <input
                        type="url"
                        id="link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
                <button type="submit" className="btn-submit">
                    Save Project
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
    );
}

export default AddProject;
