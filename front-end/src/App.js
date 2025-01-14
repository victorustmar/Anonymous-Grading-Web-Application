import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentWorkspace from "./components/StudentWorkspace";
import ProfessorWorkspace from "./components/ProfessorWorkspace";
import JuryAssignedProjects from "./components/JuryAssignedProjects";
import GradeProject from "./components/GradeProject"; 
import ProtectedRoute from "./components/ProtectedRoute";
import CreateTeam from "./components/CreateTeam";
import "./App.css"; 
function App() {
    return (
        <Router>
            <div className="app-container">
           

                <Navbar />

                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/create-team"
                        element={
                            <ProtectedRoute requiredRoles={["student"]}>
                                <CreateTeam />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student-workspace"
                        element={
                            <ProtectedRoute requiredRoles={["student"]}>
                                <StudentWorkspace />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/professor-workspace"
                        element={
                            <ProtectedRoute requiredRoles={["professor"]}>
                                <ProfessorWorkspace />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/jury-projects"
                        element={
                            <ProtectedRoute requiredRoles={["jury", "student"]}>
                                <JuryAssignedProjects />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/grade/:projectId"
                        element={
                            <ProtectedRoute requiredRoles={["jury"]}>
                                <GradeProject />
                            </ProtectedRoute>
                        }
                    />

                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;