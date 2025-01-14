import React, { useEffect, useState } from "react";

function ProfessorStudents() {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/professor/students", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch students. Please try again.");
                }

                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error("Error fetching students:", error);
                setError(error.message || "An error occurred while fetching students.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div>
            <h1>Your Students</h1>
            {loading && <p>Loading students...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && students.length === 0 && (
                <p>No students are currently assigned to you.</p>
            )}
            {!loading && students.length > 0 && (
                <ul>
                    {students.map((student) => (
                        <li key={student.StudentId}>
                            <strong>{student.User.Username}</strong> - {student.User.Email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProfessorStudents;
