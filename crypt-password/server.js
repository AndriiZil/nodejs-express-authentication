const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const mongodb = require('mongodb');

const app = express();

const packageJson = path.join(__dirname, 'package.json');
const saltRounds = 10;

mongodb.connect('mongodb://127.0.0.1:27017', (error, client) => {
    if (error) return console.log(error);
    const db = client.db(packageJson.name);
})

app.use(session({
    secret: 'SD9F9SDF12SD-GS2D-D5AS45-1D5A7RH',
    resave: false,
    saveUninitialized: true
}));

const authorize = (req, res, next) => {
    if (!req.session.user) {
        next(Error('Not logged in'));
    } else {
        next();
    }
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res, next) => {
    if (req.session.user) return res.redirect('/private');
    res.set('Content-Type', 'text/html');
    res.send(`<h2>Log in</h2>
        <form action="/login" method="POST">
            <input type="text" name="username"/>
            <input type="password" name="password"/>
            <button>Log in</button>
        </form>
        <hr/>
        <h2>Sign Up</h2>>
        <form action="/signup" method="POST">
            <input type="text" name="username">
            <input type="password" name="password">
            <button type="submit">Sign up</button>
        </form>>
    `)
});

app.post('/login', (req, res, next) => {
    if (!req.body.password || !req.body.username) return next(new Error('Must provide username and password'));
    db.collection('users').findOne({ username: req.body.username }, (error, user) => {
        if (error) return next(error);
        if (!user) return next(new Error('User name and/or password is wrong'));
        bcrypt.compare(req.body.password, user.password, (error, matched) => {
            if (!error && matched) {
                req.session.user = { username: user.username };
                res.redirect('/private');
            } else {
                next(new Error('User name and/or password is wrong'))
            }
        })
    })
});

app.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
});

app.post('/signup', (req, res, next) => {
    if (!req.body.password || !req.body.username) return next(new Error('Must provide username and password'));
    bcrypt.hash(req.body.password, 10, (error, hash) => {
        if (error) return next(error);
        db.collection('users').insert({ username: req.body.username, password: hash }, (error, result) => {
            if (error) return next(error);
            req.session.user = { username: result.opts[0].username };
            res.redirect('/private');
        })
    });
});

app.get('/private', authorize, (req, res, next) => {
    res.send(`Hi ${req.session.user.username}
        <br>
        <a href='/logout'>Log out</a>
    `)
});

app.use((err, req, res, next) => {

});

app.listen(3000, () => {
    console.log('Server was started');
});
