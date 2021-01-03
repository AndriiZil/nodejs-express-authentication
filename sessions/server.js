const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'SD9F9SDF12SD-GS2D-D5AS45-1D5A7RH',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    if (!req.session.visits) {
        req.session.visits = {
            '/': 0,
            '/private': 0
        }
    }
    next();
});

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.session.ip = ip;
    next();
});

app.get('/', (req, res, next) => {
    ++req.session.visits['/']
    res.send(`You visited ${JSON.stringify(req.session.visits)} times. Last time from ${req.session.ip}`);
});

app.get('/private', (req, res, next) => {
    ++req.session.visits['/private']
    res.send(`You visited ${JSON.stringify(req.session.visits)} times. Last time from ${req.session.ip}`);
});

app.listen(3000, () => {
    console.log('Server was started');
});
