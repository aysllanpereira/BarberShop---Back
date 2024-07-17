// modelo profissional
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Professional = sequelize.define('Professional', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Professional;
