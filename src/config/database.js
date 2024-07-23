// config database
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    timezone: "+00:00"
});

module.exports = sequelize;



