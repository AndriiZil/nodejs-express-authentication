const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const csrf = require('csurf');

const app = express();
app.use(cors());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });

app.get('/transaction', csrfProtection, (req, res) => {
    const form = `
        <script>
        const token = "${req.csrfToken()}"
        
        console.log('TOKEN', token)
        
        function sendData() {
            const data = {
                amount: document.getElementsByName('amount')[0].value,
                to: document.getElementsByName('to')[0].value,
                from: document.getElementsByName('from')[0].value
            }
            
            console.log(data);
            
            fetch('/process-transaction', {
                body: JSON.stringify(data),
                credentials: 'include',
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'CSRF-Token': token
                })
            }).then(res => res.json())
            .catch(e => console.log('Error', e))
            .then(response => console.log('Success', response))
        }
        </script>
        <form action="/no-csrf-process-transaction" method="POST">
            Amount: <input type="text" name="amount" value="100" />
            To: <input type="text" name="to" value="Azat Margan" />
            From: <input type="text" name="from" value="John Pineappleseed" />
            <button type="button" onclick="sendData()">Submit</button>
        </form>`
    res.set('content-Type', 'text/html');
    res.send(form);
});

app.post('/process-transaction', csrfProtection, (req, res) => {
    res.send({ msg: 'data is being processed' });
});

app.post('/no-csrf-process-transaction', (req, res) => {
    res.send({ msg: 'data is being processed' });
});

app.all('*', (req, res) => {
    res.send('did you mean to go to /transaction?</br><a href="/transaction">yes</a>')
});

app.listen(3000, () => {
    console.log('Server started');
});

// Hacker Script
// function sendDataNoCsrf(url) {
//     const data = {
//         amount: 1000,
//         to: 'hacker',
//         from: 'Azat Mardon'
//     }
//     console.log(data);
//     fetch(url, {
//         body: JSON.stringify(data),
//         creadentials: 'include',
//         method: 'POST',
//         headers: new Headers({
//             'Content-Type': 'application/json'
//         })
//     }).then(res => res.json())
//         .catch(e => console.error('Error', e))
//         .then(response => console.log('Success', response));
// }
//
// sendDataNoCsrf('http://localhost:3000/no-csrf-process-transaction');
// sendDataNoCsrf('http://localhost:3000/process-transaction');
