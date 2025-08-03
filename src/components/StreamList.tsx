import React, { useState, useEffect } from 'react';
import { Play, Music, Users, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Link } from 'react-router-dom';

interface Track {
  id: number;
  title: string;
  artist: string;
  filename: string;
  duration: number;
  uploadedAt: string;
}

const StreamList: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  
  const socketRef = React.useRef<Socket | null>(null);

  useEffect(() => {
    loadTracks();
    
    // Connect to socket for real-time updates
    try {
      socketRef.current = io('http://localhost:5001', {
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: false,
        timeout: 20000,
        forceNew: true
      });
      
      socketRef.current.on('connect', () => {
        console.log('StreamList socket connected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('StreamList socket connection error:', error);
      });
      
      socketRef.current.on('trackChanged', (track: Track) => {
        console.log('Track changed in StreamList:', track);
        setCurrentTrack(track);
        setPlayingTrackId(track?.id || null);
        setIsProcessing(null);
      });
      
      socketRef.current.on('playlistUpdated', () => {
        console.log('Playlist updated, reloading tracks');
        loadTracks();
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const loadTracks = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/playlist');
      const data = await response.json();
      console.log('Loaded tracks:', data);
      setTracks(data);
      
      // Get current playing track
      const statusResponse = await fetch('http://localhost:5001/api/stream/status');
      const status = await statusResponse.json();
      console.log('Stream status:', status);
      setCurrentTrack(status.currentTrack);
      setPlayingTrackId(status.currentTrack?.id || null);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (trackId: number) => {
    if (isProcessing === trackId) return;
    
    setIsProcessing(trackId);
    
    try {
      console.log('Attempting to play track:', trackId);
      
      // Make sure we have user interaction for audio
      const userInteracted = await new Promise((resolve) => {
        const handleClick = () => {
          document.removeEventListener('click', handleClick);
          resolve(true);
        };
        document.addEventListener('click', handleClick);
        
        // If this is already a user interaction, resolve immediately
        setTimeout(() => {
          document.removeEventListener('click', handleClick);
          resolve(true);
        }, 100);
      });

      if (userInteracted) {
        // Try to activate audio context
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
              console.log('Audio context resumed');
            }
            audioContext.close();
          } catch (audioError) {
            console.warn('Audio context setup failed:', audioError);
          }
        }
      }
      
      const response = await fetch(`http://localhost:5001/api/stream/play/${trackId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('Play track result:', result);
      
      if (result.success) {
        setCurrentTrack(result.track);
        setPlayingTrackId(trackId);
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg z-50 shadow-lg';
        successDiv.innerHTML = `
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span>Now Playing: ${result.track.title}</span>
          </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          successDiv.remove();
        }, 4000);
        
        // Scroll to track for visual feedback
        const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
        if (trackElement) {
          trackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
      } else {
        console.error('Failed to play track:', result.error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg z-50 shadow-lg';
        errorDiv.textContent = `Failed to play: ${result.error}`;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
          errorDiv.remove();
        }, 4000);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg z-50 shadow-lg';
      errorDiv.textContent = 'Failed to play track. Please try again.';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 4000);
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading streams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Live Audio Streams
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Discover and listen to our curated collection of Web3 music and podcasts
          </p>
          
          {currentTrack && (
            <div className="inline-flex items-center px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></div>
              Now Playing: {currentTrack.title} by {currentTrack.artist}
            </div>
          )}
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-400 mb-4">No Streams Available Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We're preparing amazing content for you! Check back soon or explore our platform features.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <span>Try Dashboard Now</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              
              <div className="text-center">
                <a 
                  href="http://localhost:5001/admin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  <Music className="h-4 w-4 mr-2" />
                  Upload Music (Admin)
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tracks.slice(0, 6).map((track, index) => (
                <motion.div
                  key={track.id}
                  data-track-id={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all cursor-pointer group relative overflow-hidden ${
                    playingTrackId === track.id 
                      ? 'border-green-500 ring-2 ring-green-500/20 bg-green-600/10' 
                      : 'border-purple-500/20 hover:border-purple-500/40 hover:bg-white/10'
                  }`}
                  onClick={() => playTrack(track.id)}
                >
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track.id);
                        }}
                        disabled={isProcessing === track.id}
                        className={`p-3 text-white rounded-full transition-all transform group-hover:scale-110 disabled:opacity-50 ${
                          playingTrackId === track.id 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-500/25' 
                            : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                        } shadow-lg`}
                      >
                        {isProcessing === track.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">by {track.artist}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Added {new Date(track.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {playingTrackId === track.id && (
                        <div className="flex items-center space-x-1 text-green-400 font-medium">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Playing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {tracks.length > 6 && (
              <div className="text-center">
                <Link 
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  View All Streams ({tracks.length}) in Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            )}
            
            {/* Audio Instructions */}
            <div className="mt-8 text-center">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 max-w-2xl mx-auto">
                <h4 className="text-blue-400 font-semibold mb-3 flex items-center justify-center">
                  <Music className="h-5 w-5 mr-2" />
                  Audio Player Instructions
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Click any track to start streaming</p>
                  <p>• Audio will appear in the music player at the bottom</p>
                  <p>• Visit the <Link to="/dashboard" className="text-purple-400 hover:text-purple-300 font-medium">Dashboard</Link> for the full experience</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default StreamList;
