import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateTeam.css';

function CreateTeam() {
    const [teamName, setTeamName] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/students/available');
                console.log("Available students fetched:", response.data);
                setAvailableStudents(response.data);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Failed to fetch available students. Please try again later.');
            }
        };

        fetchStudents();
    }, []); 

    const handleTeamNameChange = (e) => {
        setTeamName(e.target.value);
    };

    const handleMemberSelection = (e) => {
        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
        setSelectedMembers(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!teamName.trim()) {
            setError('Team name is required.');
            return;
        }

        if (selectedMembers.length !== 3) {
            setError('You must select exactly 3 team members.');
            return;
        }

        try {
            console.log("Sending team creation request:", { name: teamName, members: selectedMembers });

            const response = await axios.post(
                'http://localhost:8000/api/teams',
                { name: teamName, members: selectedMembers },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            console.log(" Team creation response:", response.data);
            setSuccess(response.data.message || 'Team created successfully!');
            setTeamName('');
            setSelectedMembers([]);

            const refreshedStudents = await axios.get('http://localhost:8000/students/available');
            setAvailableStudents(refreshedStudents.data);
        } catch (error) {
            console.error('Error creating team:', error.response || error);
            setError(
                error.response?.data?.message || 'Failed to create team. Please try again later.'
            );
        }
    };

    return (
        <div className="create-team-container">
            <h2>Create Your Team</h2>
            <form onSubmit={handleSubmit} className="create-team-form">
                <label>
                    Team Name:
                    <input
                        type="text"
                        value={teamName}
                        onChange={handleTeamNameChange}
                        placeholder="Enter team name"
                        required
                    />
                </label>
                <br />
                <label>
                    Select Team Members (exactly 3):
                    <select
                        multiple
                        value={selectedMembers}
                        onChange={handleMemberSelection}
                        required
                    >
                        {availableStudents.map((student) => (
                            <option key={student.StudentId} value={student.StudentId}>
                                {student.User?.Username || `Student #${student.StudentId}`}
                            </option>
                        ))}
                    </select>
                </label>
                <br />
                <button type="submit">Create Team</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
    );
}

export default CreateTeam;
