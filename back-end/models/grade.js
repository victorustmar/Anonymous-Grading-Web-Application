export default (sequelize, DataTypes) => {
    const Grade = sequelize.define("Grade", {
        GradeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        JuryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Jury",
                key: "JuryId",
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
