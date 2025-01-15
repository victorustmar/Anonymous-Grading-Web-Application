export default (sequelize, DataTypes) => {
    const Project = sequelize.define("Project", {
        ProjectId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        Link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        TeamName: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: "teams", // Matches the table name
                key: "TeamName",
            },
        },
    });

    Project.associate = (models) => {
        Project.hasMany(models.Grade, { foreignKey: "ProjectId" });
    };

    return Project;
};
