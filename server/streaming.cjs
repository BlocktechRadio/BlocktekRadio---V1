const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with proper CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(cors());
app.use(express.json());

// Store active streams and listeners
const activeStreams = new Map();
const listeners = new Map();
let streamCounter = 0;

// Root endpoint - Server info
app.get('/', (req, res) => {
  res.json({
    name: 'BlockTek Radio Streaming Server',
    version: '1.0.0',
    status: 'running',
    activeStreams: activeStreams.size,
    totalListeners: listeners.size,
    endpoints: {
      health: '/health',
      streams: '/api/streams',
      websocket: 'ws://localhost:3002'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeStreams: activeStreams.size,
    totalListeners: listeners.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Get active streams
app.get('/api/streams', (req, res) => {
  const streams = Array.from(activeStreams.entries()).map(([id, stream]) => ({
    id,
    title: stream.title,
    streamerName: stream.streamerName,
    listenerCount: stream.listeners.size,
    startTime: stream.startTime,
    duration: Date.now() - stream.startTime
  }));
  
  res.json({
    success: true,
    count: streams.length,
    streams: streams
  });
});

// Get stream statistics
app.get('/api/stats', (req, res) => {
  const totalListeners = Array.from(activeStreams.values())
    .reduce((total, stream) => total + stream.listeners.size, 0);
  
  res.json({
    activeStreams: activeStreams.size,
    totalListeners: totalListeners,
    connectedClients: io.engine.clientsCount,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log('User connected to streaming server:', socket.id);

  // Send welcome message
  socket.emit('connected', { message: 'Connected to BlockTek Radio streaming server' });

  // Handle stream start
  socket.on('start-stream', (data) => {
    try {
      const { title, streamerName } = data;
      streamCounter++;
      
      // Store stream info
      activeStreams.set(socket.id, {
        id: streamCounter,
        title: title || 'Untitled Stream',
        streamerName: streamerName || 'Anonymous',
        startTime: Date.now(),
        listeners: new Set()
      });

      // Notify all clients about new stream
      io.emit('stream-started', {
        streamId: socket.id,
        title: title || 'Untitled Stream',
        streamerName: streamerName || 'Anonymous'
      });

      // Confirm to streamer
      socket.emit('stream-confirmed', {
        streamId: socket.id,
        title: title || 'Untitled Stream'
      });

      console.log(`Stream started: "${title}" by ${streamerName} (ID: ${socket.id})`);
    } catch (error) {
      console.error('Error starting stream:', error);
      socket.emit('error', 'Failed to start stream');
    }
  });

  // Handle stream end
  socket.on('end-stream', () => {
    try {
      if (activeStreams.has(socket.id)) {
        const stream = activeStreams.get(socket.id);
        
        // Notify listeners that stream ended
        stream.listeners.forEach(listenerId => {
          io.to(listenerId).emit('stream-ended', {
            streamId: socket.id,
            title: stream.title
          });
        });

        activeStreams.delete(socket.id);
        
        // Notify all clients
        io.emit('stream-ended', {
          streamId: socket.id,
          title: stream.title
        });
        
        console.log(`Stream ended: "${stream.title}" (ID: ${socket.id})`);
      }
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  });

  // Handle audio chunks from streamer
  socket.on('audio-chunk', (audioData) => {
    try {
      if (activeStreams.has(socket.id)) {
        const stream = activeStreams.get(socket.id);
        
        // Broadcast audio to all listeners of this stream
        stream.listeners.forEach(listenerId => {
          socket.to(listenerId).emit('audio-chunk', audioData);
        });
      }
    } catch (error) {
      console.error('Error broadcasting audio chunk:', error);
    }
  });

  // Handle listener joining
  socket.on('join-listener', (data = {}) => {
    try {
      const { streamId } = data;
      let targetStreamId = streamId;
      
      // If no specific stream ID, join the first available stream
      if (!targetStreamId) {
        const activeStreamEntries = Array.from(activeStreams.entries());
        if (activeStreamEntries.length > 0) {
          targetStreamId = activeStreamEntries[0][0];
        }
      }
      
      if (targetStreamId && activeStreams.has(targetStreamId)) {
        const stream = activeStreams.get(targetStreamId);
        
        // Add listener to stream
        stream.listeners.add(socket.id);
        listeners.set(socket.id, targetStreamId);
        
        // Update listener count
        const listenerCount = stream.listeners.size;
        io.to(targetStreamId).emit('listener-count', listenerCount);
        io.emit('listener-count-update', {
          streamId: targetStreamId,
          count: listenerCount
        });
        
        // Send current stream info to listener
        socket.emit('stream-joined', {
          streamId: targetStreamId,
          title: stream.title,
          streamerName: stream.streamerName,
          listenerCount: listenerCount
        });
        
        console.log(`Listener ${socket.id} joined stream "${stream.title}" (${targetStreamId})`);
      } else {
        socket.emit('error', 'No active streams available');
        console.log(`No active streams for listener ${socket.id}`);
      }
    } catch (error) {
      console.error('Error joining listener:', error);
      socket.emit('error', 'Failed to join stream');
    }
  });

  // Handle listener leaving
  socket.on('leave-listener', () => {
    try {
      if (listeners.has(socket.id)) {
        const streamerId = listeners.get(socket.id);
        
        if (activeStreams.has(streamerId)) {
          const stream = activeStreams.get(streamerId);
          stream.listeners.delete(socket.id);
          
          // Update listener count
          const listenerCount = stream.listeners.size;
          io.to(streamerId).emit('listener-count', listenerCount);
          io.emit('listener-count-update', {
            streamId: streamerId,
            count: listenerCount
          });
        }
        
        listeners.delete(socket.id);
        socket.emit('listener-left');
        console.log(`Listener ${socket.id} left stream`);
      }
    } catch (error) {
      console.error('Error leaving listener:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    
    try {
      // If it was a streamer, end the stream
      if (activeStreams.has(socket.id)) {
        const stream = activeStreams.get(socket.id);
        
        // Notify listeners
        stream.listeners.forEach(listenerId => {
          io.to(listenerId).emit('stream-ended', {
            streamId: socket.id,
            title: stream.title,
            reason: 'Streamer disconnected'
          });
        });
        
        activeStreams.delete(socket.id);
        io.emit('stream-ended', {
          streamId: socket.id,
          title: stream.title,
          reason: 'Streamer disconnected'
        });
        
        console.log(`Stream ended due to disconnect: "${stream.title}"`);
      }
      
      // If it was a listener, remove from stream
      if (listeners.has(socket.id)) {
        const streamerId = listeners.get(socket.id);
        
        if (activeStreams.has(streamerId)) {
          const stream = activeStreams.get(streamerId);
          stream.listeners.delete(socket.id);
          
          // Update listener count
          const listenerCount = stream.listeners.size;
          io.to(streamerId).emit('listener-count', listenerCount);
          io.emit('listener-count-update', {
            streamId: streamerId,
            count: listenerCount
          });
        }
        
        listeners.delete(socket.id);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle ping for connection testing
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Error handling
io.on('error', (error) => {
  console.error('Socket.IO server error:', error);
});

const PORT = process.env.STREAMING_PORT || 3002;

server.listen(PORT, () => {
  console.log(`🎵 BlockTek Radio Streaming Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Server info: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down streaming server...');
  server.close(() => {
    console.log('Streaming server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };