const app = require('./app'); 
const db = require('./db');
const port = process.env.PORT || 8080;

db.init().then(() => {
  app.listen(port, () => console.log(`Listening on port ${port}!`));
}).catch(err => {
  console.log('Fail to initialize db ...');
  process.exit(1);
});

