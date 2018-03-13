const db = {counter: 0};

db.init = () => {
  db.files = db.files || [];
  return Promise.resolve();
}

db.getAll = () => Promise.resolve(db.files);

db.get = serial => {
  return new Promise((resolve, reject) => {
    for (let file of db.files) {
      if (file.serial === serial) {
        return resolve(file);
      }
    }
    reject();
  });
};

db.insert = file => {
  file.serial = `${db.counter}`;
  db.files.push(file)
  db.counter += 1;
  return Promise.resolve();
};

db.modify = file => {

};

module.exports = db;