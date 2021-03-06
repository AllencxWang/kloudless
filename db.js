const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('kloudless.db');
const uuidv4 = require('uuid/v4');
const LOCK_EXPIRATION = 60000; // 60 seconds

db.serialize(() => {
  const sql = `
    CREATE TABLE IF NOT EXISTS files (
      serial INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT,
      name TEXT,
      account INTEGER,
      token TEXT
    )`;
  db.run(sql);
});


const cache = {
  files: [],
  indexes: {} // map serial to array index
}; 

cache.init = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM files', (err, rows) => {
      if (err) {
        reject(err);
      }
      rows.forEach((row, index) => {
        cache.files.push(row);
        cache.indexes[row.serial] = index;
      });
    });
    resolve();
  });
};

cache.getAll = () => Promise.resolve(cache.files);

cache.getBySerial = serial => {
  return new Promise((resolve, reject) => {
    if (serial in cache.indexes) {
      return resolve(cache.files[ cache.indexes[serial] ]);
    }
    reject();
  });
};

cache.insert = file => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const sql = `
          INSERT INTO files (id, name, account, token)
          VALUES ("${file.id}", "${file.name}", ${file.account}, "${file.token}")
        `;
      const stmt = db.prepare(sql).run(err => {
        if (err) {
          return reject(err);
        }
        const serial = `${stmt.lastID}`;
        const {id, name, account, token} = file;
        cache.indexes[serial] = cache.files.length;
        cache.files.push({serial, id, name, account, token});
        resolve();
      });
    });
  });
};

cache.tryLockSync = serial => {
  if (serial in cache.indexes) {
    const file = cache.files[ cache.indexes[serial] ];
    if (!file.timer) {
      file.timer = setTimeout(() => {
        delete file.timer;
        delete file.uuid;
      }, LOCK_EXPIRATION);
      file.uuid = uuidv4();
      return file.uuid;
    }
  }
  return null;
};

cache.unlockSync = serial => {
  if (serial in cache.indexes) {
    const file = cache.files[ cache.indexes[serial] ];
    if (file.timer) {
      clearTimeout(file.timer);
      delete file.timer;
      delete file.uuid;
    }
  }
};

cache.getUuidSync = serial => {
  if (serial in cache.indexes) {
    const file = cache.files[ cache.indexes[serial] ];
    return file.uuid;
  }
  return null;
};

module.exports = cache;