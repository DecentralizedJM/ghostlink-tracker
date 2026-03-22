import sqlite3 from 'sqlite3';
import path from 'path';

let db = null;

export async function openDb() {
  if (db) return db;
  
  const dbPath = path.resolve(process.cwd(), 'data.sqlite');
  
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      
      database.run(`
        CREATE TABLE IF NOT EXISTS links (
          id TEXT PRIMARY KEY,
          targetUrl TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);
        database.run(`
          CREATE TABLE IF NOT EXISTS clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            linkId TEXT,
            ip TEXT,
            country TEXT,
            region TEXT,
            city TEXT,
            isp TEXT,
            userAgent TEXT,
            clickedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(linkId) REFERENCES links(id)
          )
        `, (err) => {
          if (err) return reject(err);
          db = database;
          resolve(db);
        });
      });
    });
  });
}

export function query(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    const database = await openDb();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function run(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    const database = await openDb();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    const database = await openDb();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
