const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const Readable = require('stream').Readable;
const exphbs  = require('express-handlebars');

const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

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

app.get('/', (req, res) => {
  res.redirect(301, '/pages/new');
});

app.get('/pages/new', (req, res) => {
  res.render('new');
});

app.get('/pages/view', (req, res) => {
  res.render('view', {
    main: 'this is handlebar baby'
  });
});

app.get('/pages/edit', (req, res) => {
  res.render('edit');
});

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
