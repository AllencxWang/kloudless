const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res, next) => {
  res.status(404).end('404 Not Found');
});

module.exports = app;
