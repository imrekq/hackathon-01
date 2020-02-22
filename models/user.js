const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const Post = require('./post');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    team: {
        type: Sequelize.STRING,
        allowNull: false
    },
}, {
    hooks: {
        beforeCreate: (user) => {
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync(user.password, salt);
        }
    }
});

User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

sequelize.sync()
    .then(() => User.create({
        username: 'admin',
        password: 'nopass',
        team: 'VIP'
    }))
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

User.hasMany(Post);

Post.belongsTo(User, { as: 'user'});

module.exports = User;