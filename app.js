const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const Readable = require('stream').Readable;

const app = express();

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] ? req.headers['content-type'] : '';
  if (contentType.indexOf('octet-stream') !== -1 && req.body === undefined) {
    const buffer = [];
    req.on('data', chunk => {
      buffer.push(chunk);
    });
    req.once('end', () => {
      const concated = Buffer.concat(buffer);
      req.body = concated.toString('utf8');
      next();
    });
  } else {
    next();
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/save', (req, res) => {
  const data = JSON.parse(req.body.hidden)[0];
  console.log('data:', data);
  const fileName = 'test.txt';
  const options = {
    url: `https://api.kloudless.com/v1/accounts/${data.account}/storage/files/`,
    // url: 'http://localhost:8080/api/endpoint',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${data.bearer_token.key}`,
      'X-Kloudless-Metadata': JSON.stringify({name: fileName, parent_id: data.id}),
    }
  };

  const stream = new Readable();
  stream.push(req.body.text);
  stream.push(null);
  
  stream.pipe(request.post(options, (error, response, body) => {
    if (!error && response.statusCode == 201) {
      res.status(200).json({error, response, body});
    } else {
      res.status(500).json({error, response, body});
    }
  }));
});

app.post('/api/endpoint', (req, res) => {
  console.log('----------');
  console.log('headers:', req.headers);
  console.log('body:', req.body);
  res.end();
  console.log('----------');
});

module.exports = app;
