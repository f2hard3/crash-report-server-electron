const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const server = http.createServer(app);
const minidump = require('minidump');

app.use(bodyParser.urlencoded({ extended: false }));

const crashsPath = path.join(__dirname, 'crashes');
const exceptionsPath = path.join(__dirname, 'uncaughtexceptions');

const upload = multer({
    dest: crashsPath
}).single('upload_file_minidump');

app.post('/crashreports', upload, (req, res) => {
    const body = {
        ...req.body,
        filename: req.file.filename,
        date: new Date()
    };
    const filePath = `${req.file.path}.json`;
    const report = JSON.stringify(body);

    fs.writeFile(filePath, report, err => {
        if (err) return console.error('Error Saving', report);

        console.log('Crash Saved', filePath, report);
    });

    //TODO: Save minidump into database and make an API to get the info
    minidump.walkStack(req.file.path, (err, report) => {
        if (err) return console.error('Error minidump', err);

        console.log('minidump', report.toString());
    });

    res.end();
});

app.post('/uncaughtexceptions', (req, res) => {
    const filePath = path.join(exceptionsPath, `${uuid()}.json`);
    const report = JSON.stringify({ ...req.body, date: new Date() });

    fs.writeFile(filePath, report, err => {
        if (err) return console.error('Error Saving', report);

        console.log('Exception Saved', filePath, report);
    });

    //TODO: Save report into database and make an API to get the info
    console.log('report', report);

    res.end();
});

server.listen(3000, () =>
    console.log('Crash report server runnning on Port 3000.')
);
