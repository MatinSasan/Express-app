const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-app', 'root', 'admin', {
    dialect: 'mysql',
    host: '127.0.0.1'
});

module.exports = sequelize;