const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const Readable = require('stream').Readable;
const exphbs = require('express-handlebars');
const app = express();
const db = require('./db');

const notFound = res => err => 
  res.status(404).end(`404 Not Found\r\n${JSON.stringify(err)}`);

const download = serial => new Promise((resolve, reject) => {
  db.getBySerial(serial).then(file => {
    const {account, id} = file;
    const options = {
      url: `https://api.kloudless.com/v1/accounts/${account}/storage/files/${id}/contents`,
      headers: {
        'Authorization': `Bearer ${file.token}`,
      }
    };
    resolve(request(options));
  }).catch(reject);
});

db.init();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.redirect(301, '/pages/new');
});

app.get('/pages/new', (req, res) => {
  res.render('new');
});

app.get('/pages/view', (req, res) => {
  db.getAll().then(files => res.render('view', {files}));
});

app.get('/pages/edit/:serial', (req, res) => {
  const serial = req.params.serial;
  db.getBySerial(serial).then(file => {
    // TODO: fetch content via API
    // res.render('edit');
  }).catch(notFound(res));
});

app.post('/api/save', (req, res) => {
  const expData = JSON.parse(req.body.hidden)[0];
  const fileName = `${Date.now()}.txt`;
  const options = {
    url: `https://api.kloudless.com/v1/accounts/${expData.account}/storage/files/`,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${expData.bearer_token.key}`,
      'X-Kloudless-Metadata': JSON.stringify({name: fileName, parent_id: expData.id}),
    }
  };

  const readable = new Readable();
  readable.push(req.body.text);
  readable.push(null);
  
  readable.pipe(request.post(options, (error, response, body) => {
    if (!error && response.statusCode === 201) {
      const file = JSON.parse(body);
      file.token = expData.bearer_token.key;
      db.insert(file).then(() => res.redirect('/pages/new'));
    } else {
      res.status(500).json({error, response, body});
    }
  }));
});

app.get('/api/download/:serial', (req, res) => {
  const serial = req.params.serial;
  download(serial).then(readable => {
    readable.pipe(res);
  }).catch(notFound(res));
});

module.exports = app;
