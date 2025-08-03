const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'blocktek_radio.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admin credentials table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          role TEXT DEFAULT 'admin',
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default admin user
      db.run(`
        INSERT OR IGNORE INTO admin_users (username, password_hash, email, role) 
        VALUES ('admin', 'blocktekradio2025', 'admin@blocktekradio.com', 'super_admin')
      `);

      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_address TEXT UNIQUE NOT NULL,
          username TEXT,
          email TEXT,
          profile_image TEXT,
          tokens_earned INTEGER DEFAULT 0,
          listening_hours REAL DEFAULT 0,
          nfts_owned INTEGER DEFAULT 0,
          rank_position INTEGER DEFAULT 0,
          streak_days INTEGER DEFAULT 0,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tracks table
      db.run(`
        CREATE TABLE IF NOT EXISTS tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          filename TEXT NOT NULL,
          path TEXT NOT NULL,
          duration REAL DEFAULT 0,
          file_size INTEGER DEFAULT 0,
          uploaded_by TEXT,
          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          play_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1
        )
      `);

      // Streaming sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS streaming_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          track_id INTEGER,
          session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
          session_end DATETIME,
          duration_listened REAL DEFAULT 0,
          tokens_earned INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (track_id) REFERENCES tracks (id)
        )
      `);

      // Background stream schedule table
      db.run(`
        CREATE TABLE IF NOT EXISTS background_streams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          track_id INTEGER NOT NULL,
          duration_minutes INTEGER NOT NULL,
          start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          end_time DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_by TEXT,
          FOREIGN KEY (track_id) REFERENCES tracks (id)
        )
      `);

      // Activity log table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          activity_type TEXT NOT NULL,
          description TEXT,
          tokens_earned INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          console.log('Default admin credentials: username=admin, password=blocktekradio2025');
          resolve();
        }
      });
    });
  });
}

module.exports = { db, initializeDatabase };
