const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { db, initializeDatabase } = require('./database/database');
const ytdl = require('ytdl-core'); // Add this at the top

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Range"]
  }
});

const PORT = process.env.PORT || 5001;

// Initialize database
initializeDatabase()
  .then(() => {
    // Auto-start background stream when server starts
    setTimeout(() => {
      startDefaultBackgroundStream();
    }, 2000); // Wait 2 seconds for everything to initialize
  })
  .catch(console.error);

// Middleware
app.use(cors({
  origin: '*', // Allow requests from all origins
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Range", "Authorization"],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File mimetype:', file.mimetype);
    console.log('File originalname:', file.originalname);
    
    // Check if it's an audio file by mimetype
    const isAudio = file.mimetype.startsWith('audio/');
    
    // Also check by file extension as backup
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const hasAudioExtension = audioExtensions.includes(fileExtension);
    
    if (isAudio || hasAudioExtension) {
      cb(null, true);
    } else {
      cb(new Error(`Only audio files are allowed! Received: ${file.mimetype} with extension ${fileExtension}`), false);
    }
  }
});

// In-memory state (for real-time features)
let currentTrack = null;
let isPlaying = false;
let currentTime = 0;
let currentBackgroundTrack = null;
let backgroundStreamActive = false;
let backgroundStreamTimer = null;

// Simple admin authentication (in production, use proper JWT and database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'blocktekradio2025'
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const { authorization } = req.headers;
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  const token = authorization.split(' ')[1];
  
  // Simple token validation (in production, use proper JWT verification)
  if (token === 'admin-authenticated-blocktekradio') {
    next();
  } else {
    res.status(401).json({ error: 'Invalid admin token' });
  }
};

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.json({ 
      success: true, 
      token: 'admin-authenticated-blocktekradio',
      message: 'Admin login successful'
    });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true, message: 'Admin logout successful' });
});

// User management endpoints
app.post('/api/users/connect', async (req, res) => {
  const { walletAddress, username, email } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        // Update last activity
        db.run(
          'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE wallet_address = ?',
          [walletAddress],
          (updateErr) => {
            if (updateErr) {
              console.error('Update error:', updateErr);
            }
            res.json({ success: true, user, isNewUser: false });
          }
        );
      } else {
        // Create new user
        db.run(
          'INSERT INTO users (wallet_address, username, email) VALUES (?, ?, ?)',
          [walletAddress, username || null, email || null],
          function(insertErr) {
            if (insertErr) {
              console.error('Insert error:', insertErr);
              return res.status(500).json({ error: 'Failed to create user' });
            }
            
            const newUser = {
              id: this.lastID,
              wallet_address: walletAddress,
              username,
              email,
              tokens_earned: 0,
              listening_hours: 0,
              nfts_owned: 0,
              rank_position: 0,
              streak_days: 0
            };
            
            res.json({ success: true, user: newUser, isNewUser: true });
          }
        );
      }
    });
  } catch (error) {
    console.error('User connect error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/profile/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  
  db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user });
  });
});

// Admin user management
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  db.all(`
    SELECT 
      id,
      wallet_address,
      username,
      email,
      tokens_earned,
      listening_hours,
      nfts_owned,
      rank_position,
      streak_days,
      last_activity,
      created_at
    FROM users 
    ORDER BY created_at DESC
  `, (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ success: true, users });
  });
});

// Fix the admin playlist endpoint to not require auth for reading
app.get('/api/admin/playlist', (req, res) => {
  db.all(`
    SELECT 
      id,
      title,
      artist,
      filename,
      duration,
      file_size,
      upload_date as uploadedAt,
      play_count,
      is_active
    FROM tracks 
    WHERE is_active = 1 
    ORDER BY upload_date DESC
  `, (err, tracks) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(tracks);
  });
});

// Only protect the sensitive admin endpoints
app.use('/api/admin/upload', authenticateAdmin);
app.use('/api/admin/track/:id', authenticateAdmin);

// Updated track management with database
app.post('/api/admin/upload', (req, res) => {
  upload.single('audio')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
      }
      return res.status(400).json({ error: 'Upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { title, artist } = req.body;
    const filename = req.file.filename;
    const filepath = req.file.path;
    const fileSize = req.file.size;

    // Save to database
    db.run(
      'INSERT INTO tracks (title, artist, filename, path, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title || req.file.originalname, artist || 'Unknown Artist', filename, filepath, fileSize, 'admin'],
      function(insertErr) {
        if (insertErr) {
          console.error('Database insert error:', insertErr);
          return res.status(500).json({ error: 'Failed to save track to database' });
        }

        const newTrack = {
          id: this.lastID,
          title: title || req.file.originalname,
          artist: artist || 'Unknown Artist',
          filename,
          path: filepath,
          duration: 0,
          uploadedAt: new Date().toISOString()
        };

        // Notify all clients about new track
        io.emit('playlistUpdated');
        
        res.json({ success: true, track: newTrack });
      }
    );
  });
});

app.delete('/api/admin/track/:id', (req, res) => {
  const trackId = parseInt(req.params.id);
  
  // Get track info first
  db.get('SELECT * FROM tracks WHERE id = ?', [trackId], (err, track) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Delete file
    if (fs.existsSync(track.path)) {
      fs.unlinkSync(track.path);
    }
    
    // Mark as inactive instead of deleting
    db.run('UPDATE tracks SET is_active = 0 WHERE id = ?', [trackId], (updateErr) => {
      if (updateErr) {
        console.error('Database update error:', updateErr);
        return res.status(500).json({ error: 'Failed to delete track' });
      }
      
      // If this was the current track, stop playing
      if (currentTrack && currentTrack.id === trackId) {
        currentTrack = null;
        isPlaying = false;
        currentTime = 0;
      }
      
      io.emit('playlistUpdated');
      io.emit('trackChanged', currentTrack);
      
      res.json({ success: true });
    });
  });
});

// Background streaming endpoints
app.get('/api/background-stream/status', (req, res) => {
  res.json({
    currentTrack: currentBackgroundTrack,
    isActive: backgroundStreamActive
  });
});

app.post('/api/admin/background-stream/schedule', authenticateAdmin, (req, res) => {
  const { trackId, duration } = req.body;
  const validDuration = Math.min(Math.max(duration || 30, 5), 999999);
  
  db.get('SELECT * FROM tracks WHERE id = ? AND is_active = 1', [trackId], (err, track) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Stop any existing stream
    stopBackgroundStream();
    
    // Save to database
    db.run(
      'INSERT INTO background_streams (track_id, duration_minutes, created_by) VALUES (?, ?, ?)',
      [trackId, validDuration, 'admin'],
      function(insertErr) {
        if (insertErr) {
          console.error('Database insert error:', insertErr);
          return res.status(500).json({ error: 'Failed to schedule stream' });
        }
        
        const scheduleItem = {
          id: this.lastID,
          trackId,
          track: {
            id: track.id,
            title: track.title,
            artist: track.artist,
            filename: track.filename,
            duration: track.duration
          },
          duration: validDuration,
          startTime: new Date(),
          isActive: true
        };
        
        startBackgroundStream(scheduleItem);
        
        res.json({ 
          success: true, 
          schedule: scheduleItem,
          message: validDuration >= 999999 ? 'Continuous stream started' : `Stream scheduled for ${validDuration} minutes`
        });
      }
    );
  });
});

app.post('/api/background-stream/next', (req, res) => {
  // Get random track from database for fallback
  db.get('SELECT * FROM tracks WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1', (err, track) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (track) {
      currentBackgroundTrack = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        filename: track.filename,
        duration: track.duration
      };
      backgroundStreamActive = true;
      
      io.emit('backgroundStreamChanged', currentBackgroundTrack);
      io.emit('backgroundStreamStateChanged', { isPlaying: true });
    }
    
    res.json({ success: true, track: currentBackgroundTrack });
  });
});

app.post('/api/admin/background-stream/stop', authenticateAdmin, (req, res) => {
  stopBackgroundStream();
  res.json({ success: true, message: 'Background stream stopped' });
});

// Auto-start default background stream function
function startDefaultBackgroundStream() {
  console.log('Checking for default background stream...');
  
  // Only start if no stream is currently active
  if (!backgroundStreamActive) {
    db.get('SELECT * FROM tracks WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1', (err, track) => {
      if (!err && track) {
        const defaultScheduleItem = {
          id: Date.now(),
          trackId: track.id,
          track: {
            id: track.id,
            title: track.title,
            artist: track.artist,
            filename: track.filename,
            duration: track.duration
          },
          duration: 999999, // Continuous mode
          startTime: new Date(),
          isActive: true
        };
        
        console.log('Auto-starting default background stream:', track.title);
        startBackgroundStream(defaultScheduleItem);
      } else {
        console.log('No tracks available for default background stream');
      }
    });
  }
}

// Enhanced background stream management functions
function startBackgroundStream(scheduleItem) {
  currentBackgroundTrack = scheduleItem.track;
  backgroundStreamActive = true;
  
  // Clear existing timer
  if (backgroundStreamTimer) {
    clearTimeout(backgroundStreamTimer);
  }
  
  // Notify all clients immediately
  console.log(`Background stream started: ${currentBackgroundTrack.title} for ${scheduleItem.duration} minutes`);
  io.emit('backgroundStreamChanged', currentBackgroundTrack);
  io.emit('backgroundStreamStateChanged', { isPlaying: true });
  
  // For continuous streams (999999+ duration), set up auto-restart with next track
  if (scheduleItem.duration >= 999999) {
    console.log('Continuous background stream mode activated - will cycle tracks every 5 minutes');
    
    // Set timer to change to next track every 5 minutes for variety
    backgroundStreamTimer = setTimeout(() => {
      cycleToContinuousNextTrack();
    }, 5 * 60 * 1000); // 5 minutes
  } else {
    // Original timed stream logic
    backgroundStreamTimer = setTimeout(() => {
      scheduleItem.isActive = false;
      
      db.get('SELECT * FROM tracks WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1', (err, track) => {
        if (!err && track) {
          const continuousItem = {
            id: Date.now(),
            trackId: track.id,
            track: {
              id: track.id,
              title: track.title,
              artist: track.artist,
              filename: track.filename,
              duration: track.duration
            },
            duration: 999999, // Switch to continuous mode
            startTime: new Date(),
            isActive: true
          };
          startBackgroundStream(continuousItem);
        } else {
          stopBackgroundStream();
        }
      });
    }, scheduleItem.duration * 60 * 1000);
  }
}

// New function to cycle to next track in continuous mode
function cycleToContinuousNextTrack() {
  console.log('Cycling to next track in continuous mode...');
  
  db.get(`
    SELECT * FROM tracks 
    WHERE is_active = 1 AND id != ? 
    ORDER BY RANDOM() LIMIT 1
  `, [currentBackgroundTrack?.id || 0], (err, track) => {
    if (!err && track) {
      const nextScheduleItem = {
        id: Date.now(),
        trackId: track.id,
        track: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          filename: track.filename,
          duration: track.duration
        },
        duration: 999999, // Keep continuous mode
        startTime: new Date(),
        isActive: true
      };
      
      startBackgroundStream(nextScheduleItem);
    } else {
      // If no other tracks, restart current track
      if (currentBackgroundTrack) {
        const restartItem = {
          id: Date.now(),
          trackId: currentBackgroundTrack.id,
          track: currentBackgroundTrack,
          duration: 999999,
          startTime: new Date(),
          isActive: true
        };
        startBackgroundStream(restartItem);
      }
    }
  });
}

// Enhanced auto-restart mechanism - check every 30 seconds
setInterval(() => {
  if (!backgroundStreamActive) {
    console.log('Background stream inactive, restarting...');
    startDefaultBackgroundStream();
  }
}, 30000); // Check every 30 seconds

// Updated streaming endpoints
app.post('/api/stream/play/:id', (req, res) => {
  const trackId = parseInt(req.params.id);
  
  db.get('SELECT * FROM tracks WHERE id = ? AND is_active = 1', [trackId], (err, track) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    currentTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      filename: track.filename,
      duration: track.duration
    };
    isPlaying = true;
    currentTime = 0;
    
    // Update play count
    db.run('UPDATE tracks SET play_count = play_count + 1 WHERE id = ?', [trackId]);
    
    // Notify all clients
    io.emit('trackChanged', currentTrack);
    io.emit('playStateChanged', { isPlaying, currentTime });
    
    res.json({ success: true, track: currentTrack });
  });
});

app.post('/api/stream/pause', (req, res) => {
  isPlaying = false;
  io.emit('playStateChanged', { isPlaying, currentTime });
  res.json({ success: true });
});

app.post('/api/stream/resume', (req, res) => {
  isPlaying = true;
  io.emit('playStateChanged', { isPlaying, currentTime });
  res.json({ success: true });
});

app.get('/api/stream/status', (req, res) => {
  // Get current playlist from database
  db.all('SELECT * FROM tracks WHERE is_active = 1 ORDER BY upload_date DESC', (err, tracks) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      currentTrack,
      isPlaying,
      currentTime,
      playlist: tracks
    });
  });
});

app.get('/api/stream/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log('Streaming audio file:', filename);
  console.log('File path:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error('Audio file not found:', filePath);
    return res.status(404).json({ error: 'Audio file not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Set CORS headers for audio streaming
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Range');
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
    };
    
    console.log('Serving range request:', { start, end, chunksize });
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    };
    
    console.log('Serving full file:', fileSize);
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Admin endpoint to add a YouTube link to the playlist
app.post('/api/admin/youtube-stream', authenticateAdmin, async (req, res) => {
  const { youtubeUrl } = req.body;

  if (!youtubeUrl || !ytdl.validateURL(youtubeUrl)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(youtubeUrl);
    const title = info.videoDetails.title;
    const artist = info.videoDetails.author.name;

    // Add the YouTube track to the playlist
    const newTrack = {
      id: Date.now(),
      title,
      artist,
      filename: youtubeUrl, // Use the URL as the filename
      duration: parseInt(info.videoDetails.lengthSeconds, 10),
      uploadDate: new Date().toISOString(),
      isActive: true,
      isYouTube: true // Mark this track as a YouTube track
    };

    db.run(
      'INSERT INTO tracks (title, artist, filename, duration, is_active, is_youtube) VALUES (?, ?, ?, ?, ?, ?)',
      [title, artist, youtubeUrl, newTrack.duration, 1, 1],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save YouTube track to database' });
        }

        newTrack.id = this.lastID; // Use the database ID
        io.emit('playlistUpdated'); // Notify clients about the updated playlist
        res.json({ success: true, track: newTrack });
      }
    );
  } catch (error) {
    console.error('Failed to process YouTube URL:', error);
    res.status(500).json({ error: 'Failed to process YouTube URL' });
  }
});

// Stream YouTube audio
app.get('/api/stream/youtube/:id', (req, res) => {
  const trackId = parseInt(req.params.id);

  db.get('SELECT * FROM tracks WHERE id = ? AND is_youtube = 1', [trackId], (err, track) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!track) {
      return res.status(404).json({ error: 'YouTube track not found' });
    }

    try {
      const stream = ytdl(track.filename, { filter: 'audioonly', quality: 'highestaudio' });
      res.setHeader('Content-Type', 'audio/mpeg');
      stream.pipe(res);
    } catch (error) {
      console.error('Failed to stream YouTube audio:', error);
      res.status(500).json({ error: 'Failed to stream YouTube audio' });
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  console.log('Connection origin:', socket.handshake.headers.origin);
  
  // Send current state to new connection
  socket.emit('trackChanged', currentTrack);
  socket.emit('playStateChanged', { isPlaying, currentTime });
  
  // Send current playlist from database
  db.all('SELECT * FROM tracks WHERE is_active = 1 ORDER BY upload_date DESC', (err, tracks) => {
    if (!err) {
      socket.emit('playlistUpdated', tracks);
    }
  });
  
  // Send background stream state
  socket.emit('backgroundStreamChanged', currentBackgroundTrack);
  socket.emit('backgroundStreamStateChanged', { isPlaying: backgroundStreamActive });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log('CORS origins allowed:', ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"]);
});
