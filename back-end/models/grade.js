export default (sequelize, DataTypes) => {
    const Grade = sequelize.define("Grade", {
        GradeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        StudentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Students",
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
