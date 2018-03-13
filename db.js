const db = {counter: 0};

db.init = () => {
  db.files = db.files || [];
  db.indexes = {}; // map serial to array index
  return Promise.resolve();
};

db.getAll = () => Promise.resolve(db.files);

db.getBySerial = serial => {
  return new Promise((resolve, reject) => {
    if (serial in db.indexes) {
      return resolve(db.files[ db.indexes[serial] ]);
    }
    reject();
  });
};

db.insert = file => {
  const serial = `${db.counter}` 
  file.serial = serial;
  db.indexes[serial] = db.files.length;
  db.files.push(file)
  db.counter += 1;
  return Promise.resolve();
};

db.tryLockSync = serial => {
  if (serial in db.indexes) {
    const file = db.files[ db.indexes[serial] ];
    if (!file.lockTimer) {
      file.lockTimer = setTimeout(() => file.lockTimer = null, 60000);
      return true;
    }
  }
  return false;
};

db.unlockSync = serial => {
  if (serial in db.indexes) {
    const file = db.files[ db.indexes[serial] ];
    if (file.lockTimer) {
      clearTimeout(file.lockTimer);
      file.lockTimer = null;
    }
  }
};

module.exports = db;