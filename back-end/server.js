sequelize.options.logging = console.log;
console.log("Sequelize SQL Logging Enabled.");

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { sequelize, Sequelize, User, Student, Professor, Team, Project , Grade, Jury} from "./models/index.js";
import grade from "./models/grade.js";



const app = express();
const port = 8000;

const JWT_SECRET = "your_jwt_secret";

app.use(cors());
app.use(express.json());

sequelize
    .authenticate()
    .then(() => {
        console.log("Database connection established successfully.");
        // Synchronize the database without altering or forcing destructive changes
        return sequelize.sync();
    })
    .then(async () => {
        console.log("Database synchronized!");

        // Check if Users_backup table exists and create it if it doesn't
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Users_backup (
                UserId INTEGER PRIMARY KEY,
                Username VARCHAR(255) NOT NULL,
                Password VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL UNIQUE,
                UserType VARCHAR(255) NOT NULL,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL
            );
        `);
        console.log("Users_backup table ensured.");

        // Populate Users_backup table with data from Users
        await sequelize.query(`
            INSERT OR IGNORE INTO Users_backup (UserId, Username, Password, Email, UserType, createdAt, updatedAt)
            SELECT DISTINCT UserId, Username, Password, Email, UserType, createdAt, updatedAt
            FROM Users;
        `);
        console.log("Users_backup table populated.");
    })
    .catch((error) => {
        console.error("Database initialization failed:", error);
        process.exit(1); // Exit the process if there's a fatal error
    });



const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.UserId,
            userType: user.UserType,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

const restrictAccess = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.userType)) {
            return res.status(403).json({ message: "Access forbidden: insufficient permissions" });
        }
        next();
    };
};

app.post("/api/register", async (req, res) => {
    const { username, password, email, userType } = req.body;

    // Validare pentru toate câmpurile
    if (!username || !password || !email || !userType) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Verifică dacă utilizatorul există deja în baza de date
        const existingUser = await User.findOne({ where: { Email: email } });
        if (existingUser) {
            // Dacă utilizatorul există deja, verifică dacă este profesor
            if (userType === "professor") {
                const professor = await Professor.findOne({ where: { UserId: existingUser.UserId } });
                if (professor) {
                    return res.status(409).json({ message: "Professor already registered with this email." });
                }
                // Dacă utilizatorul există dar nu este profesor, creează profesorul
                await Professor.create({ UserId: existingUser.UserId });
                return res.status(201).json({ message: "Professor successfully registered.", user: existingUser });
            }
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        // Creează utilizatorul nou
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            Username: username,
            Password: hashedPassword,
            Email: email,
            UserType: userType,
        });

        if (userType === "student") {
            await Student.create({ UserId: user.UserId, TeamId: null });
        } else if (userType === "professor") {
            await Professor.create({ UserId: user.UserId });
        }

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ where: { Email: email } });

        if (!user) {
            return res.status(401).json({ field: "email", message: "Email not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ field: "password", message: "Incorrect password." });
        }

        const token = generateToken(user);
        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                userId: user.UserId,
                username: user.Username,
                userType: user.UserType,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/students/available', async (req, res) => {
    try {
        const availableStudents = await Student.findAll({
            where: {
                TeamId: null, 
            },
            include: [
                {
                    model: User,
                    attributes: ['Username'], 
                },
            ],
            attributes: ['StudentId', 'UserId'], 
        });

        res.status(200).json(availableStudents);
    } catch (error) {
        console.error('Error fetching available students:', error);
        res.status(500).json({ message: 'Failed to fetch available students' });
    }
});
app.get('/teams/student/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const student = await Student.findOne({ where: { UserId: userId } });

        if (!student || !student.TeamId) {
            return res.status(404).json({ message: "Student is not part of any team." });
        }

        const team = await Team.findOne({
            where: { id: student.TeamId },
            include: [
                {
                    model: Student,
                    include: [{ model: User, attributes: ['Username'] }],
                },
            ],
        });

        res.status(200).json(team);
    } catch (error) {
        console.error('Error fetching team for student:', error);
        res.status(500).json({ message: 'Failed to fetch team for student.' });
    }
});


//create Team
app.post('/api/teams', authenticateToken, restrictAccess(['student']), async (req, res) => {
    const { name, members } = req.body;

    console.log("Request received at /api/teams:");
    console.log("Team Name:", name);
    console.log("Member IDs:", members);

    if (!name || !members || members.length !== 3) {
        console.log("Validation failed: Missing or incorrect data");
        return res.status(400).json({
            message: "Team name is required, and exactly 3 members must be selected.",
        });
    }

    try {
        const existingTeam = await Team.findOne({ where: { TeamName: name } });
        if (existingTeam) {
            console.log("Team name already exists:", name);
            return res.status(400).json({ message: 'A team with this name already exists.' });
        }

        const unavailableStudents = await Student.findAll({
            where: {
                StudentId: members,
                TeamId: { [Sequelize.Op.ne]: null },
            },
        });

        if (unavailableStudents.length > 0) {
            console.log("Some students are already in a team:", unavailableStudents.map(s => s.StudentId));
            return res.status(400).json({
                message: `Some students are already part of a team: ${unavailableStudents.map(s => s.StudentId).join(', ')}`,
            });
        }

        console.log("Creating team:", name);
        const newTeam = await Team.create({ TeamName: name });
        console.log("Team created successfully:", newTeam.TeamId);

        console.log("Assigning team to students...");
        const updateResult = await Student.update(
            { TeamId: newTeam.TeamId },
            { where: { StudentId: members } }
        );
        console.log("Students updated:", updateResult);

        res.status(201).json({
            message: 'Team created successfully',
            teamId: newTeam.TeamId,
        });
    } catch (error) {
        console.error("Error in /api/teams:", error.message, error.stack);
        res.status(500).json({
            message: 'Failed to create team. Please try again later.',
        });
    }
});

app.get('/api/teams/student', authenticateToken, restrictAccess(['student']), async (req, res) => {
    const userId = req.user.userId;

    try {
        const student = await Student.findOne({ where: { UserId: userId } });

        if (!student || !student.TeamId) {
            return res.status(404).json({
                message: "Student is not part of any team."
            });
        }

        const team = await Team.findOne({
            where: { TeamId: student.TeamId },
            include: [
                {
                    model: Student,
                    include: [{ model: User, attributes: ['Username'] }],
                },
            ],
        });

        res.status(200).json(team);
    } catch (error) {
        console.error("Error fetching student's team:", error);
        res.status(500).json({
            message: "Failed to fetch team. Please try again later.",
        });
    }
});

app.post("/api/createproject", async (req, res) => {
    const { title, description, link, teamName } = req.body;

    if (!title || !description || !teamName) {
        return res.status(400).json({ message: "Title, Description, and Team Name are required." });
    }

    try {
        const team = await Team.findOne({ where: { TeamName: teamName } });

        if (!team) {
            return res.status(404).json({ message: "Team not found with the provided name." });
        }

        const project = await Project.create({
            Title: title,
            Description: description,
            Link: link,
            TeamName: team.TeamName,
        });

        res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Failed to create project." });
    }
});



app.post('/api/teams', authenticateToken, restrictAccess(['student']), async (req, res) => {
    const { TeamName, memberIds } = req.body;

    if (!TeamName || !memberIds || !Array.isArray(memberIds) || memberIds.length < 1) {
        return res.status(400).json({
            message: "Team name and at least one valid team member are required."
        });
    }

    try {
        console.log("Creating team with name:", TeamName);

        const team = await Team.create({ TeamName });
        console.log("Team created with TeamId:", team.TeamId);

        const validStudents = await Student.findAll({
            where: { StudentId: memberIds }
        });

        if (validStudents.length !== memberIds.length) {
            console.warn("Invalid student IDs provided:", memberIds);
            return res.status(400).json({
                message: "One or more provided student IDs are invalid."
            });
        }

        console.log("Valid students fetched:", validStudents.map(s => s.StudentId));

        await Student.update(
            { TeamId: team.TeamId },
            { where: { StudentId: memberIds } }
        );

        console.log("Students updated with TeamId:", team.TeamId);

        res.status(201).json({
            message: "Team created successfully",
            team,
        });
    } catch (error) {
        console.error("Error creating team:", error.message, error.stack);
        res.status(500).json({
            message: "Failed to create team. Please try again later.",
            error: error.message
        });
    }
});


app.post('/api/projects', async (req, res) => {
    const { title, teamId } = req.body;

    if (!title || !teamId) {
        return res.status(400).json({ message: "Title and team ID are required" });
    }

    const project = await Project.create({ Title: title, TeamId: teamId });

    res.status(201).json({ message: "Project created successfully", project });
});

app.post('/api/projects/:projectId/jury', async (req, res) => {
    const { projectId } = req.params;

    const students = await Student.findAll({ where: { TeamId: null } });
    const juryMembers = students.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const student of juryMembers) {
        await Jury.create({ UserId: student.UserId, ProjectId: projectId });
    }

    res.status(200).json({ message: "Jury assigned successfully", jury: juryMembers });
});

app.get("/api/teams/professor", authenticateToken, restrictAccess(["professor"]), async (req, res) => {
    try {
        const teams = await Team.findAll({
            include: [
                {
                    model: Student,
                    include: [{ model: User, attributes: ["Username"] }],
                },
            ],
        });

        const teamData = teams.map((team) => ({
            TeamName: team.TeamName,
            Members: team.Students.map((student) => student.User.Username),
        }));

        res.status(200).json(teamData);
    } catch (error) {
        console.error("Error fetching teams for professor:", error);
        res.status(500).json({ message: "Failed to fetch teams. Please try again later." });
    }
});
app.get("/api/professor/students", authenticateToken, restrictAccess(["professor"]), async (req, res) => {
    try {
        const professor = await Professor.findOne({
            where: { UserId: req.user.userId },
        });

        if (!professor) {
            return res.status(404).json({ message: "Professor not found." });
        }

        const students = await Student.findAll({
            where: { ProfessorId: professor.ProfessorId },
            include: [{ model: User, attributes: ["Username", "Email"] }],
        });

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students for professor:", error);
        res.status(500).json({ message: "Failed to fetch students." });
    }
});

app.post('/api/grades', async (req, res) => {
    const {  projectId, gradeValue } = req.body;

    await Grade.create({  ProjectId: projectId, GradeValue: gradeValue });

    res.status(201).json({ message: "Grade submitted successfully" });
});
app.get('/api/projects/:projectId/final-grade', async (req, res) => {
    const { projectId } = req.params;

    const grades = await Grade.findAll({ where: { ProjectId: projectId } });
    const average = grades.reduce((sum, grade) => sum + grade.GradeValue, 0) / grades.length;

    await Project.update({ FinalGrade: average }, { where: { ProjectId: projectId } });

    res.status(200).json({ message: "Final grade calculated", finalGrade: average });
});
app.get("/api/professor-projects", authenticateToken, restrictAccess(["professor"]), async (req, res) => {
    try {
        console.log("Professor ID:", req.user.userId);

        const projects = await Project.findAll({
            include: [
                {
                    model: Team,
                    include: [
                        {
                            model: Student,
                            include: [{ model: User, attributes: ["Username"] }],
                        },
                    ],
                },
                {
                    model: Grade,
                    attributes: ["GradeValue"],
                },
            ],
        });

        console.log("Projects fetched:", projects);

        if (!projects.length) {
            return res.status(404).json({ message: "No projects found for this professor." });
        }

        const formattedProjects = projects.map((project) => ({
            title: project.Title,
            teamName: project.Team.TeamName,
            members: project.Team.Students.map((student) => student.User.Username),
            grades: project.Grades.map((grade) => grade.GradeValue),
        }));

        res.status(200).json(formattedProjects);
    } catch (error) {
        console.error("Error fetching professor projects:", error);
        res.status(500).json({ message: "Failed to fetch professor projects." });
    }
});

app.get("/api/jury-projects", authenticateToken, restrictAccess(["jury"]), async (req, res) => {
    try {
        const juryAssignments = await Jury.findAll({
            where: { UserId: req.user.userId },
            include: [
                {
                    model: Project,
                    include: [{ model: Team, attributes: ["TeamName"] }],
                },
            ],
        });

        const projects = juryAssignments.map((assignment) => ({
            id: assignment.Project.ProjectId,
            title: assignment.Project.Title,
            teamName: assignment.Project.Team.TeamName,
        }));

        res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching jury projects:", error);
        res.status(500).json({ message: "Failed to fetch jury projects." });
    }
});

app.post("/api/assign-jury", async (req, res) => {
    const { projectId } = req.body;

    try {
        const project = await Project.findByPk(projectId, {
            include: [{ model: Team, include: [Student] }],
        });

        const excludedStudentIds = project.Team.Students.map((student) => student.StudentId);

        const availableStudents = await Student.findAll({
            where: {
                StudentId: { [Op.notIn]: excludedStudentIds },
            },
        });

        if (availableStudents.length < 3) {
            return res.status(400).json({ message: "Not enough students available for jury." });
        }

        const selectedJury = availableStudents.sort(() => 0.5 - Math.random()).slice(0, 3);

        for (const juryMember of selectedJury) {
            await Jury.create({ UserId: juryMember.UserId, ProjectId: projectId });
        }

        res.status(201).json({ message: "Jury assigned successfully.", jury: selectedJury });
    } catch (error) {
        console.error("Error assigning jury:", error);
        res.status(500).json({ message: "Failed to assign jury." });
    }
});
/* app.post("/api/grade/:projectId", authenticateToken, restrictAccess(["jury", "student"]), async (req, res) => {
    const { projectId } = req.params;
    const { gradeValue } = req.body;

    if (!gradeValue || gradeValue < 1 || gradeValue > 10) {
        return res.status(400).json({ message: "Grade must be between 1 and 10." });
    }

    try {
        const jury = await Jury.findOne({
            where: {
                UserId: req.user.userId,
                ProjectId: projectId,
            },
        });

        if (!jury) {
            return res.status(404).json({ message: "Jury assignment not found for this project." });
        }

        await Grade.create({ JuryId: jury.JuryId, ProjectId: projectId, GradeValue: gradeValue });
        res.status(201).json({ message: "Grade submitted successfully." });
    } catch (error) {
        console.error("Error submitting grade:", error);
        res.status(500).json({ message: "Failed to submit grade." });
    }
}); */

app.post("/api/grade/:projectId", authenticateToken, restrictAccess(["student"]), async (req, res) => {
    const { projectId } = req.params;
    const { gradeValue } = req.body;

    // Validate grade value
    if (!gradeValue || gradeValue < 1 || gradeValue > 10) {
        return res.status(400).json({ message: "Grade must be between 1 and 10." });
    }

    try {
        // Verify the student exists
        const student = await Student.findOne({
            where: { UserId: req.user.userId }, // Map UserId to StudentId
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Verify if the project exists
        const project = await Project.findOne({ where: { ProjectId: projectId } });

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Check if the student has already graded this project
        const existingGrade = await Grade.findOne({
            where: {
                StudentId: student.StudentId, // Use the correct StudentId
                ProjectId: projectId,
            },
        });

        if (existingGrade) {
            return res.status(400).json({ message: "You have already graded this project." });
        }

        console.log({
            StudentId: student.StudentId, // Log the correct StudentId
            ProjectId: projectId,
            grade: gradeValue,
        });

        // Create a new grade entry
        await Grade.create({
            StudentId: student.StudentId, // Use the correct StudentId
            ProjectId: projectId,
            grade: gradeValue,
        });

        res.status(201).json({ message: "Grade submitted successfully." });
    } catch (error) {
        console.error("Error submitting grade:", error);
        res.status(500).json({ message: "Failed to submit grade." });
    }
});


app.get('/api/projects/team/:teamName', authenticateToken, restrictAccess(['student']), async (req, res) => {
    const { teamName } = req.params;

    try {
        const projects = await Project.findAll({
            where: { TeamName: teamName },
        });

        if (!projects) {
            return res.status(404).json({ message: "No projects found for this team." });
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching team projects:", error);
        res.status(500).json({ message: "Failed to fetch team projects." });
    }
});


app.get("/api/grades/:teamName", async (req, res) => {
    const { teamName } = req.params;

    try {
        const projects = await Project.findAll({
            where: { TeamName: teamName },
            include: [{ model: Grade, attributes: ["GradeValue"] }],
        });

        const grades = projects.map((project) => ({
            ProjectTitle: project.Title,
            GradeValue: project.Grades.map((grade) => grade.GradeValue),
        }));

        res.status(200).json(grades);
    } catch (error) {
        console.error("Error fetching grades:", error);
        res.status(500).json({ message: "Failed to fetch grades." });
    }
});
app.get('/api/teams/list', authenticateToken, async (req, res) => {
    try {
        console.log("Fetching all teams with their members...");

        const teams = await Team.findAll({
            include: [{
                model: Student,
                attributes: ['StudentId'],
                include: [{
                    model: User,
                    attributes: ['Username']
                }]
            }]
        });

        console.log("Teams fetched successfully:", teams.length);

        res.status(200).json(teams);
    } catch (error) {
        console.error("Error fetching teams:", error.message, error.stack);
        res.status(500).json({
            message: "Failed to fetch teams. Please try again later.",
            error: error.message
        });
    }
});

app.get('/api/jury/random-project', authenticateToken, restrictAccess(['student']), async (req, res) => {
    try {
        const student = await Student.findOne({ where: { UserId: req.user.userId } });

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Fetch all projects not belonging to the student's team
        const projects = await Project.findAll({
            where: {
                TeamName: { [Sequelize.Op.ne]: student.TeamId },
            },
            include: [
                {
                    model: Grade,
                    attributes: ['GradeId'],
                },
            ],
        });

        // Filter projects with fewer than 3 grades
        const filteredProjects = projects.filter((project) => project.Grades.length < 3);

        if (filteredProjects.length === 0) {
            return res.status(404).json({ message: "No eligible projects available." });
        }

        // Select a random project
        const randomProject = filteredProjects[Math.floor(Math.random() * filteredProjects.length)];

        res.status(200).json(randomProject);
    } catch (error) {
        console.error("Error fetching random project:", error);
        res.status(500).json({ message: "Failed to fetch a random project." });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
    } else {
        console.error('Server error:', err);
    }
});

