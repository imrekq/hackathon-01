const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const Log = sequelize.define('logs', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    },
    text: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    }
});

sequelize.sync()
    .then(() => console.log('logs table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

module.exports = Log;