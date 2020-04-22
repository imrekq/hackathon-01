const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const ejs = require('ejs');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const app = express();

const User = require('./models/user');
const Post = require('./models/post');
const Log = require('./models/log');

const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_id) {
        res.redirect('/chat');
    } else {
        next();
    }
};

const userChecker = (req, res, next) => {
    if (!req.session.user || !req.cookies.user_id) {
        res.redirect('/login');
    } else {
        next();
    }
};

const COOKIE_USER_ID = 'user_id';

app.set('port', process.env.PORT || 3000);
app.set('views', './public');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    key: COOKIE_USER_ID,
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false
    }
}));

app.use((req, res, next) => {
    if (req.cookies[COOKIE_USER_ID] && !req.session.user) {
        res.clearCookie(COOKIE_USER_ID);
    }
    next();
});


app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login', { title: 'Login' });
    })
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({
            where: { username: username }
        })
            .then(function (user) {

                if (!user) {
                    res.redirect('/login');
                }
                else if (!user.validPassword(password)) {
                    res.redirect('/login');
                } else {
                    req.session.user = user.dataValues;
                    res.redirect('/chat');
                }
            });
    });

app.route('/register')
    .get(sessionChecker, (req, res) => {
        res.render('register', { title: 'Register' });
    })
    .post(sessionChecker, (req, res) => {
        const body = req.body;

        if (body.password === body.repeatPassword) {
            User.create({
                username: body.username,
                password: body.password,
                team: body.team
            }).then(() => {
                res.redirect('/login');
            });
        } else {
            res.status(400);
        }
    });

app.route('/chat')
    .get(userChecker, (req, res) => {
        Post.findAll({
            where: {
                [Op.and]: [{
                    text: { [Op.substring]: req.query.search || '' }
                }]
            },
            order: [['createdAt', 'DESC']],
            include: ['user']
        })
            .then((posts) => {
                res.render('chat', {
                    title: 'Chat',
                    posts,
                    search: req.query.search || '',
                    username: req.session.user.username
                });
            })
    })
    .post(userChecker, (req, res) => {
        const text = req.body.text;
        Post.create({
            text: text,
            userId: req.session.user.id
        }).then(() => {
            res.redirect('/chat');
        });
    });

app.route('/home')
    .get(userChecker, (req, res) => {
        Log.findAll({
            where: {
                username: req.session.user.username
            },
            order: [['createdAt', 'DESC']]
        })
            .then((logs) => {
                res.render('home', {
                    title: 'home',
                    logs,
                    host: req.headers.host,
                    username: req.session.user.username
                });
            })
    });

app.route('/q')
    .get((req, res) => {
        Log.create({
            username: req.query.u,
            text: req.query.t
        }).then(() => {
            res.render('answer');
        });
    });




app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies[COOKIE_USER_ID]) {
        res.clearCookie(COOKIE_USER_ID);
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));
