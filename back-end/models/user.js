export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        UserType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'Users', 
        timestamps: true,
    });
    return User;
};
