const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { create } = require('ipfs-http-client');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// IPFS client setup
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from(
      process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET
    ).toString('base64')
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
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
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audio field'));
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image field'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload files to IPFS
app.post('/api/upload', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const results = {};
    
    // Upload audio file
    if (req.files.audio) {
      const audioFile = req.files.audio[0];
      const audioBuffer = fs.readFileSync(audioFile.path);
      const audioResult = await ipfs.add(audioBuffer);
      results.audioHash = audioResult.path;
      
      // Clean up local file
      fs.unlinkSync(audioFile.path);
    }
    
    // Upload image file
    if (req.files.image) {
      const imageFile = req.files.image[0];
      const imageBuffer = fs.readFileSync(imageFile.path);
      const imageResult = await ipfs.add(imageBuffer);
      results.imageHash = imageResult.path;
      
      // Clean up local file
      fs.unlinkSync(imageFile.path);
    }
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get crypto prices from CoinGecko
app.get('/api/crypto-prices', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Crypto prices error:', error);
    res.status(500).json({
      error: 'Failed to fetch crypto prices',
      fallback: [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 43250.00,
          price_change_percentage_24h: 2.5,
          market_cap: 847000000000,
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          current_price: 2650.00,
          price_change_percentage_24h: -1.2,
          market_cap: 318000000000,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        }
      ]
    });
  }
});

// Stream audio content
app.get('/api/stream/:contentId', (req, res) => {
  const { contentId } = req.params;
  
  // In a real implementation, you would:
  // 1. Verify user has access to this content
  // 2. Fetch the actual audio file from IPFS or storage
  // 3. Stream the content
  
  // For demo, return a placeholder response
  res.json({
    streamUrl: `https://ipfs.io/ipfs/${contentId}`,
    title: 'Demo Stream',
    artist: 'BlockTek Radio'
  });
});

// Get educational content
app.get('/api/education', (req, res) => {
  // Mock educational content data
  const educationalContent = [
    {
      id: 1,
      title: "Introduction to DeFi",
      description: "Learn the fundamentals of Decentralized Finance",
      duration: "45 min",
      category: "defi",
      instructor: "Alex Chen",
      rating: 4.8,
      students: 1247,
      isTokenGated: false,
      thumbnail: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "NFT Creation Masterclass",
      description: "Everything you need to know about creating NFTs",
      duration: "1h 20min",
      category: "nft",
      instructor: "Sarah Johnson",
      rating: 4.9,
      students: 892,
      isTokenGated: true,
      requiredNFTs: 1,
      thumbnail: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];
  
  res.json(educationalContent);
});

// User analytics endpoint
app.post('/api/analytics/listening', (req, res) => {
  const { userAddress, duration, contentId } = req.body;
  
  // In a real implementation, you would:
  // 1. Validate the user address
  // 2. Record listening analytics
  // 3. Update user rewards
  
  console.log(`User ${userAddress} listened for ${duration} minutes to content ${contentId}`);
  
  res.json({
    success: true,
    rewardsEarned: Math.floor(duration / 60) * 10 // 10 tokens per hour
  });
});

// Get user stats
app.get('/api/user/:address/stats', (req, res) => {
  const { address } = req.params;
  
  // Mock user stats - in real implementation, fetch from database
  const userStats = {
    listeningHours: 127,
    tokensEarned: 2450,
    nftsOwned: 8,
    rank: 42,
    streaksDay: 15
  };
  
  res.json(userStats);
});

// Streaming endpoints
app.get('/api/streams/active', (req, res) => {
  // Mock active streams data
  const activeStreams = [
    {
      id: 'stream-1',
      title: 'DeFi Deep Dive',
      streamerName: 'CryptoExpert.eth',
      listenerCount: 234,
      startTime: Date.now() - 3600000 // 1 hour ago
    }
  ];
  
  res.json(activeStreams);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BlockTek Radio server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Start streaming server
require('./streaming.cjs');

module.exports = app;