export default (sequelize, DataTypes) => {
    const Student = sequelize.define(
        "Student",
        {
            StudentId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            UserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "UserId",
                },
            },
            TeamId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "teams",
                    key: "TeamId",
                },
            },
        },
        {
            tableName: "Students",
            timestamps: true,
        }
    );

    Student.associate = (models) => {
        Student.belongsTo(models.Team, {
            foreignKey: "TeamId",
            as: "Team",
            onDelete: "SET NULL",
        });

        Student.belongsTo(models.User, {
            foreignKey: "UserId",
            as: "User",
            onDelete: "CASCADE",
        });
    };

    return Student;
};
