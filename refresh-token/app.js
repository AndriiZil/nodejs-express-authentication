const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require('./config');
const app = express();

const auth = require('./tokenChecker');

const tokenList = {};

app.use(express.json());

router.get('/', (req, res) => {
    return res.send('Ok');
});

router.post('/login', (req, res) => {
    const postData = req.body;

    const user = {
        email: postData.email,
        name: postData.name
    };
    // do the database authentication here, with user name and password combination.
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife});
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife});

    const response = {
        status: 'Logged in',
        token: token,
        refreshToken: refreshToken,
    };

    tokenList[refreshToken] = response
    res.status(200).json(response);
})

router.post('/token', (req, res) => {
    // refresh the damn token
    const postData = req.body;
    // if refresh token exists
    if ((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            email: postData.email,
            name: postData.name
        };

        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            token: token,
        };
        // update the token in the list
        tokenList[postData.refreshToken].token = token;
        return res.status(200).json(response);
    } else {
        return res.status(404).json({
            message: 'Invalid request'
        });
    }
});

router.get('/secure', auth, (req, res) => {
    // all secured routes goes here
    res.json({
        message: 'I am secured...'
    })
});

app.use('/api', router);

app.listen(config.port || process.env.port || 3000);
