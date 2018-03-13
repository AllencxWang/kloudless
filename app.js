const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const Readable = require('stream').Readable;
const exphbs = require('express-handlebars');
const app = express();
const db = require('./db');

const download = serial => new Promise((resolve, reject) => {
  db.getBySerial(serial).then(file => {
    const {account, id} = file;
    const options = {
      url: `https://api.kloudless.com/v1/accounts/${account}/storage/files/${id}/contents`,
      headers: {
        'Authorization': `Bearer ${file.token}`,
      }
    };
    resolve({file, readable: request(options)});
  }).catch(reject);
});

db.init();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
  res.redirect(301, '/pages/new');
});

app.get('/pages/new', (req, res, next) => {
  res.render('new');
});

app.get('/pages/view', (req, res, next) => {
  db.getAll().then(files => res.render('view', {files}));
});

app.get('/pages/edit/:serial', (req, res, next) => {
  const serial = req.params.serial;
  const uuid = db.tryLockSync(serial);
  if (uuid) {
    download(serial).then(({file, readable}) => {
      const buffer = [];
      readable.on('data', chunk => buffer.push(chunk));
      readable.once('end', () => {
        const text = Buffer.concat(buffer);
        res.render('edit', {name: file.name, text, serial, uuid});
      });
      readable.once('error', () => res.status(500).json({error}));
    }).catch(next);
  } else {
    db.getAll().then(files => res.render('view', {
      files, message: 'the file you are trying to edit was locked'
    }));
  }
});

app.post('/api/save', (req, res, next) => {
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
      db.insert(file)
        .then(() => res.redirect('/pages/view'))
        .catch(err => {
          res.status(500).json({error: err});
        });
    } else {
      res.status(500).json({error, response, body});
    }
  }));
});

app.get('/api/uuids/:serial', (req, res, next) => {
  res.json({uuid: db.getUuidSync(req.params.serial)});
});

app.post('/api/update', (req, res, next) => {
  const {text, serial} = req.body;
  db.getBySerial(serial).then(file => {
    const options = {
      url: `https://api.kloudless.com/v1/accounts/${file.account}/storage/files/${file.id}`,
      headers: {
        // 'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${file.token}`,
        // 'X-Kloudless-Metadata': JSON.stringify({name: fileName, parent_id: expData.id}),
      }
    };
  
    const readable = new Readable();
    readable.push(text);
    readable.push(null);
    
    readable.pipe(request.put(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        db.unlockSync(serial);
        res.redirect('/pages/view');
      } else {
        res.status(500).json({error, response, body});
      }
    }));

  }).catch(next);
});

app.get('/api/download/:serial', (req, res, next) => {
  const serial = req.params.serial;
  download(serial).then(({readable}) => {
    readable.pipe(res);
  }).catch(next);
});

app.get('*', (req, res, next) => {
  res.status(404).end('404 Not Found');
});

module.exports = app;
