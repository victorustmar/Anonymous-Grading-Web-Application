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
                unique: true,
            },
        },
        {
            tableName: "teams",
            timestamps: true,
        }
    );

    return Team;
};
