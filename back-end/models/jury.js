export default (sequelize, DataTypes) => {
    const Jury = sequelize.define(
        "Jury",
        {
            JuryId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            UserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users", // Ensure this matches the Users table
                    key: "UserId",
                },
            },
            ProjectId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Projects", // Ensure this matches the Projects table
                    key: "ProjectId",
                },
            },
        },
        {
            tableName: "Jury", // Match the new table name
            timestamps: true, // Automatically add createdAt and updatedAt
        }
    );

    return Jury;
};
