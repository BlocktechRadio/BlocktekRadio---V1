const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_address TEXT UNIQUE NOT NULL,
          username TEXT,
          email TEXT,
          tokens_earned INTEGER DEFAULT 0,
          listening_hours INTEGER DEFAULT 0,
          nfts_owned INTEGER DEFAULT 0,
          rank_position INTEGER DEFAULT 0,
          streak_days INTEGER DEFAULT 0,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          filename TEXT NOT NULL,
          duration INTEGER NOT NULL,
          is_active INTEGER DEFAULT 1,
          is_youtube INTEGER DEFAULT 0,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS background_streams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          track_id INTEGER NOT NULL,
          duration_minutes INTEGER NOT NULL,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (track_id) REFERENCES tracks(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS user_activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          track_id INTEGER,
          activity_type TEXT NOT NULL,
          activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (track_id) REFERENCES tracks(id)
        )
      `);

      resolve();
    });
  });
};

module.exports = {
  db,
  initializeDatabase
};