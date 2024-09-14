const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Path to the file where credentials will be stored
const filePath = path.join(__dirname, 'users.txt');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', () => {
            const userData = querystring.parse(body);
            const { firstName, lastName, mobileNumber, email, password, confirmPassword } = userData;

            if (password !== confirmPassword) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Passwords do not match!');
                return;
            }

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err && err.code !== 'ENOENT') {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server error');
                    return;
                }

                const users = data ? JSON.parse(data) : {};

                if (users[email]) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Account with this email already exists!');
                } else {
                    users[email] = { firstName, lastName, mobileNumber, password };
                    fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Server error');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end('Account created successfully!');
                        }
                    });
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
