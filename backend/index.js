/**
 * BlockTek Radio Backend API
 * 
 * This Express server provides REST endpoints for:
 * - Health checks
 * - Admin authentication (simple token-based)
 * - Uploading and managing audio tracks (admin only)
 * - Streaming audio files (with CORS and range support)
 * - Managing a background radio stream (continuous or scheduled)
 * 
 * Notes:
 * - File uploads are stored in /tmp/uploads on Vercel (ephemeral storage)
 * - Playlist is kept in-memory (stateless on Vercel, not persistent)
 * - For production, use a persistent database and external file storage
 * - CORS is configured for both local dev and production frontends
 * 
 * Endpoints:
 *   GET    /api/health                       - Health check
 *   POST   /api/admin/login                  - Admin login (returns token)
 *   GET    /api/background-stream/status     - Get current background stream info
 *   GET    /api/admin/playlist               - Get active playlist
 *   POST   /api/admin/upload                 - Upload new audio track (admin only)
 *   DELETE /api/admin/track/:id              - Mark track as inactive (admin only)
 *   GET    /api/stream/audio/:filename       - Stream audio file (with range support)
 *   POST   /api/background-stream/next       - Switch to next track in playlist
 *   POST   /api/admin/youtube-stream         - Add YouTube audio to playlist (admin only)
 *   GET    /api/stream/youtube/:id           - Stream YouTube audio
 * 
 * To run locally: `NODE_ENV=development node index.js`
 * To deploy on Vercel: see vercel.json and deploy with `vercel --prod`
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core'); // Add this at the top

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.bloktekradio.net', 'https://blocktek-radio.vercel.app', 'http://localhost:5173', 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept', 'Origin', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.static('public'));

// Use /tmp directory for file uploads on Vercel
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : './uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for Vercel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio/');
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const hasAudioExtension = audioExtensions.includes(fileExtension);
    
    if (isAudio || hasAudioExtension) {
      cb(null, true);
    } else {
      cb(new Error(`Only audio files are allowed! Received: ${file.mimetype}`), false);
    }
  }
});

// In-memory storage for Vercel (since serverless functions are stateless)
let playlist = [
  {
    id: 1,
    title: "Blockchain Basics",
    artist: "BlockTek Radio",
    filename: "demo-track-1.mp3",
    duration: 180,
    uploadDate: new Date().toISOString(),
    isActive: true
  },
  {
    id: 2,
    title: "DeFi Deep Dive",
    artist: "Crypto Expert",
    filename: "demo-track-2.mp3",
    duration: 240,
    uploadDate: new Date().toISOString(),
    isActive: true
  }
];

let currentTrackIndex = 0;
let currentBackgroundTrack = playlist[0];
let backgroundStreamActive = true;

// Simple admin authentication
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'blocktekradio2025'
};

const authenticateAdmin = (req, res, next) => {
  const { authorization } = req.headers;
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  const token = authorization.split(' ')[1];
  
  if (token === 'admin-authenticated-blocktekradio') {
    next();
  } else {
    res.status(401).json({ error: 'Invalid admin token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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

// Background stream status
app.get('/api/background-stream/status', (req, res) => {
  const currentTrack = currentBackgroundTrack || playlist[currentTrackIndex] || null;
  res.json({
    currentTrack,
    isActive: backgroundStreamActive,
    totalTracks: playlist.length,
    currentIndex: currentTrackIndex
  });
});

// Get playlist
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
      return res.status(500).json({ error: 'Failed to load playlist' });
    }
    
    res.json({ success: true, tracks });
  });
});

// Upload endpoint
app.post('/api/admin/upload', authenticateAdmin, (req, res) => {
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
    
    const newTrack = {
      id: Date.now(),
      title: title || req.file.originalname,
      artist: artist || 'Unknown Artist',
      filename: req.file.filename,
      duration: 0,
      uploadDate: new Date().toISOString(),
      isActive: true
    };

    playlist.push(newTrack);
    
    res.json({ success: true, track: newTrack });
  });
});

// Admin endpoint to stream YouTube audio
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

    playlist.push(newTrack);

    res.json({ success: true, track: newTrack });
  } catch (error) {
    console.error('Failed to process YouTube URL:', error);
    res.status(500).json({ error: 'Failed to process YouTube URL' });
  }
});

// Delete track endpoint
app.delete('/api/admin/track/:id', authenticateAdmin, (req, res) => {
  const trackId = parseInt(req.params.id);
  const trackIndex = playlist.findIndex(track => track.id === trackId);
  
  if (trackIndex === -1) {
    return res.status(404).json({ error: 'Track not found' });
  }
  
  // Mark as inactive instead of deleting
  playlist[trackIndex].isActive = false;
  
  res.json({ success: true });
});

// Stream audio endpoint
app.get('/api/stream/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  console.log('Streaming audio file:', filename);
  console.log('File path:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('Audio file not found:', filePath);
    return res.status(404).json({ error: 'Audio file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

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
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Stream YouTube audio
app.get('/api/stream/youtube/:id', async (req, res) => {
  const trackId = parseInt(req.params.id);
  const track = playlist.find(t => t.id === trackId && t.isYouTube);

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

// Background stream control
app.post('/api/background-stream/next', (req, res) => {
  const activePlaylist = playlist.filter(track => track.isActive);
  if (activePlaylist.length > 0) {
    currentTrackIndex = (currentTrackIndex + 1) % activePlaylist.length;
    currentBackgroundTrack = activePlaylist[currentTrackIndex];
    backgroundStreamActive = true;
  }
  
  res.json({ success: true, track: currentBackgroundTrack });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
