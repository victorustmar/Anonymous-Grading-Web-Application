import { Sequelize, Op } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.db", 
    logging: console.log,
});
export { sequelize, Op };
export default sequelize;
