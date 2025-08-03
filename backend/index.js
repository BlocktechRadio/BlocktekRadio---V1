const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://blocktek-radio-v1.vercel.app', 'https://blocktek-radio.vercel.app', 'https://your-frontend-domain.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

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
  }
});

// In-memory storage for Vercel (since files don't persist)
let playlist = [
  {
    id: 1,
    title: "Blockchain Basics",
    artist: "BlockTek Radio",
    filename: "demo-track-1.mp3",
    duration: 180,
    uploadDate: new Date().toISOString()
  },
  {
    id: 2,
    title: "DeFi Deep Dive",
    artist: "Crypto Expert",
    filename: "demo-track-2.mp3",
    duration: 240,
    uploadDate: new Date().toISOString()
  }
];

let currentTrackIndex = 0;
let isPlaying = false;

// ...existing code for routes...

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Background stream status
app.get('/api/background-stream/status', (req, res) => {
  const currentTrack = playlist[currentTrackIndex] || null;
  res.json({
    currentTrack,
    isActive: isPlaying,
    totalTracks: playlist.length,
    currentIndex: currentTrackIndex
  });
});

// Upload endpoint
app.post('/api/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { title, artist } = req.body;
    
    const newTrack = {
      id: Date.now(),
      title: title || 'Untitled',
      artist: artist || 'Unknown Artist',
      filename: req.file.filename,
      duration: 0, // You'd need a library like ffprobe to get actual duration
      uploadDate: new Date().toISOString()
    };

    playlist.push(newTrack);

    res.json({
      success: true,
      message: 'Track uploaded successfully',
      track: newTrack
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Stream audio endpoint
app.get('/api/stream/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  // For demo purposes, return a placeholder response
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

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

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
