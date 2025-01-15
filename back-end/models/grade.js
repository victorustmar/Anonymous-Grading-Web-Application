export default (sequelize, DataTypes) => {
    const Grade = sequelize.define("Grade", {
        GradeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        JuryId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Changed to allow null as JuryId may not be used anymore
            references: {
                model: "Jury",
                key: "JuryId",
            },
        },
        StudentId: {
            type: DataTypes.INTEGER,
            allowNull: false, // StudentId is mandatory
            references: {
                model: "Students", // Ensure this matches your students table name
                key: "StudentId",
            },
        },
        ProjectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Projects",
                key: "ProjectId",
            },
        },
        grade: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    });
    return Grade;
};
