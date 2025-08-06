const http = require('http');
const querystring = require('querystring');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // Show form page
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
                <h1>Student Info Form</h1>
                <form method="POST">
                    <label>Student Name:</label>
                    <input type="text" name="name" required><br><br>
                    <label>Course:</label>
                    <input type="text" name="course" required><br><br>
                    <button type="submit">submit</button>
                </form>
                <br>
                <a href="/list">View Student List</a>
        `);
        res.end();

        // Submit form
    } else if (req.method === 'POST' && req.url === '/') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = querystring.parse(body);
            const record = `name : ${data.name}, Course : ${data.course}\n`;

            fs.appendFile('student.txt', record, (err) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                if (err) {
                    res.end('<h1>Error saving data!</h1>');
                    return;
                }
                res.write(`<h1>Student Info Submitted</h1>`);
                res.write(`<p><b>Name:</b> ${data.name}</p>`);
                res.write(`<p><b>Course:</b> ${data.course}</p>`);
                res.write(`<p style="color:green;">Data saved to student.txt</p>`);
                res.write(`<br><a href="/">Back to Form</a> | <a href="/list">View Student List</a>`);
                res.end();
            });
        });

        // View student list
    } else if (req.method === 'GET' && req.url === '/list') {
        fs.readFile('student.txt', 'utf8', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(`<h1>Student List</h1>`);

            if (err || !data.trim()) {
                res.write('<p>No students found</p>');
            } else {
                const students = data.split('\n').filter(line => line.trim() !== '');
                res.write('<ul>');
                students.forEach(student => res.write(`<li>${student}</li>`));
                res.write('</ul>');
            }

            res.write(`
                <form method="POST" action="/clear" style="margin-top:20px;">
                    <button type="submit" style="background:red;color:white;padding:5px 10px;">Clear All Students</button>
                </form>
            `);
            res.write('<br><a href="/">Back to Form</a>');
            res.end();
        });

        // Clear all students
    } else if (req.method === 'POST' && req.url === '/clear') {
        fs.writeFile('student.txt', '', (err) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            if (err) {
                res.end('<h1>Error clearing students</h1>');
                return;
            }
            res.write('<h1>All Students Cleared</h1>');
            res.write('<a href="/">Back to Form</a> | <a href="/list">View Student List</a>');
            res.end();
        });

        // Handle unknown pages
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Page Not Found</h1>');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
