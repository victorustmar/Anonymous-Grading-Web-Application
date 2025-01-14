export default (sequelize, DataTypes) => {
    const Professor = sequelize.define(
        "Professor",
        {
            ProfessorId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        },
        {
            tableName: "Professors",
            timestamps: true, // Automatically adds `createdAt` and `updatedAt`
        }
    );

    return Professor;
};
