/* export default (sequelize, DataTypes) => {
    const Team = sequelize.define(
        "Team",
        {
            TeamId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TeamName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: "teams",
            timestamps: true,
        }
    );

    Team.associate = (models) => {
        Team.hasMany(models.Student, {
            foreignKey: "TeamId",
            as: "Students",
            onDelete: "SET NULL",
        });
    };

    return Team;
}; */

export default (sequelize, DataTypes) => {
    const Team = sequelize.define(
        "Team",
        {
            TeamId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TeamName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, // Add this if it's not already unique
            },
        },
        {
            tableName: "teams",
            timestamps: true,
        }
    );

    return Team;
};
