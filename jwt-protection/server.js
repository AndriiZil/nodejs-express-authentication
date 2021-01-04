const SECRET = 'Secret String';
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());

const courses = [
    { title: 'You dont know Node' },
    { title: 'AWS Intro' },
];

const users = [];

const auth = (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        jwt.verify(req.headers.authorization.split(' ')[1], SECRET, (err, decoded) => {
            if (err) return res.status(401).end();
            req.user = decoded
            console.log('Authenticated as', decoded.username);
            next();
        });
    } else {
        return res.status(401).end();
    }
}

app.get('/courses', (req, res) => {
    res.send(courses);
});

app.post('/courses', auth, (req, res) => {
    courses.push({ title: req.body.title });
    res.send(courses);
});

app.post('/auth/register', (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.status(500).end();
        users.push({
            username: req.body.username,
            passwordHash: hash
        });
        res.status(201).send({ message: 'Registered' });
    });
});

app.post('/auth/login', (req, res) => {
    const foundUser = users.find((value, index, list) => {
        if (value.username === req.body.username) return true;
        else return false;
    });

    if (foundUser) {
        bcrypt.compare(req.body.password, foundUser.passwordHash, (err, matched) => {
            if (!err && matched) {
                res.status(201).json({ token: jwt.sign({ username: foundUser.username }, SECRET) });
            } else {
                res.status(401).end();
            }
        })
    } else {
        res.status(401).end();
    }
});

app.listen(3000, () => {
    console.log('Server started');
});
