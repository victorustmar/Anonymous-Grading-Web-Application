import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.db", 
    logging: console.log,
});

export default sequelize;
