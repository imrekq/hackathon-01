const Sequelize = require('sequelize');

const User = require('./user');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const Post = sequelize.define('posts', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    }
});

sequelize.sync()
    .then(() => console.log('posts table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

module.exports = Post;