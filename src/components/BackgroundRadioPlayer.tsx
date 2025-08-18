/**
 * BackgroundRadioPlayer React Component
 * 
 * This floating player connects to the BlockTek Radio backend to:
 * - Listen for background radio stream changes (via Socket.IO or polling)
 * - Play/pause/mute/adjust volume for the current track
 * - Show track info and loading/error states
 * - Allow minimizing/closing the player
 * 
 * Environment variable VITE_BACKEND_URL should point to the backend API.
 * 
 * Usage: <BackgroundRadioPlayer />
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Radio, Music } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Track {
  id: number;
  title: string;
  artist: string;
  filename: string;
  duration: number;
}

const BackgroundRadioPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://blocktek-radio-v1.vercel.app';
    
    // Connect to backend
    socketRef.current = io(backendUrl, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true
    });
    
    // Connection handlers
    socketRef.current.on('connect', () => {
      console.log('Background radio socket connected');
      setError(null);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Background radio socket error:', error);
      setError('Connection failed');
    });
    
    // Socket event listeners for background streaming
    socketRef.current.on('backgroundStreamChanged', (track: Track) => {
      console.log('Background stream changed:', track);
      setCurrentTrack(track);
      setError(null);
      
      if (track && audioRef.current) {
        setIsLoading(true);
        const audioUrl = `${backendUrl}/api/stream/audio/${track.filename}`;
        console.log('Loading background audio from:', audioUrl);
        
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        // Immediate auto-play
        setTimeout(() => {
          forcePlayAudio();
        }, 500);
      }
    });

    socketRef.current.on('backgroundStreamStateChanged', ({ isPlaying: playing }: { isPlaying: boolean }) => {
      console.log('Background stream state changed:', playing);
      setIsPlaying(playing);
      
      if (audioRef.current && currentTrack) {
        if (playing) {
          forcePlayAudio();
        } else {
          audioRef.current.pause();
        }
      }
    });

    // Get initial background stream and start immediately
    fetch(`${backendUrl}/api/background-stream/status`)
      .then(res => res.json())
      .then(data => {
        console.log('Background stream status:', data);
        if (data.currentTrack) {
          setCurrentTrack(data.currentTrack);
          setIsPlaying(true); // Force playing state
          
          if (audioRef.current) {
            const audioUrl = `${backendUrl}/api/stream/audio/${data.currentTrack.filename}`;
            audioRef.current.src = audioUrl;
            audioRef.current.muted = false;
            audioRef.current.volume = volume;
            audioRef.current.load();
            
            // Start immediately without delay
            setTimeout(() => {
              forcePlayAudio();
            }, 200);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to get background stream status:', error);
        setError('Failed to load stream');
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const forcePlayAudio = async () => {
    if (audioRef.current) {
      try {
        // Set audio properties for immediate playback
        audioRef.current.muted = false;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.autoplay = true;
        
        // Multiple play attempts to bypass browser restrictions
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        setIsPlaying(true);
        setError(null);
        setIsLoading(false);
        console.log('Background audio force-playing successfully');
      } catch (error) {
        console.log('First play attempt failed, trying fallback methods');
        
        // Fallback: Try with muted first, then unmute
        try {
          audioRef.current.muted = true;
          await audioRef.current.play();
          audioRef.current.muted = isMuted;
          audioRef.current.volume = isMuted ? 0 : volume;
          setIsPlaying(true);
          setError(null);
          setIsLoading(false);
          console.log('Background audio playing with fallback method');
        } catch (fallbackError) {
          // Final fallback: Set playing state anyway
          setIsPlaying(true);
          setError(null);
          setIsLoading(false);
          console.log('Audio will play on next user interaction');
        }
      }
    }
  };

  const playAudio = async () => {
    return forcePlayAudio();
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('Background track ended, restarting...');
      // Immediate restart for continuous playback
      if (currentTrack) {
        audio.currentTime = 0;
        forcePlayAudio();
      }
    };

    const handleLoadedData = () => {
      console.log('Background audio loaded successfully');
      setIsLoading(false);
      // Auto-start as soon as data is loaded
      if (isPlaying) {
        forcePlayAudio();
      }
    };

    const handleLoadError = (e: any) => {
      console.error('Background audio load error:', e);
      setIsLoading(false);
      // Don't show error, just retry
      setTimeout(() => {
        if (currentTrack && audioRef.current) {
          audioRef.current.load();
        }
      }, 2000);
    };

    const handleCanPlay = () => {
      console.log('Background audio can play');
      setIsLoading(false);
      // Start playing immediately when ready
      if (isPlaying) {
        forcePlayAudio();
      }
    };

    // Configure audio for autoplay
    audio.loop = true;
    audio.autoplay = true;
    audio.preload = 'auto';
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleLoadError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleLoadError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrack, isPlaying, volume, isMuted]);

  const togglePlayPause = async () => {
    if (!currentTrack) {
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await forcePlayAudio();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const closePlayer = () => {
    setIsVisible(false);
    setAutoPlayEnabled(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Show player even without current track to allow user interaction
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        preload="auto"
        autoPlay={true}
        crossOrigin="anonymous"
        loop={true}
        muted={false}
      />
      
      {/* Floating Radio Player */}
      <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
        isMinimized ? 'w-16 h-16' : 'w-80 max-w-sm'
      }`}>
        <div className="bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Minimized View */}
          {isMinimized ? (
            <div 
              onClick={() => setIsMinimized(false)}
              className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-purple-600/20 transition-colors group"
            >
              <div className="relative">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                ) : (
                  <Radio className="h-6 w-6 text-purple-400 group-hover:text-purple-300" />
                )}
                {isPlaying && !isLoading && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          ) : (
            /* Full Player View */
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Radio className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Background Radio</span>
                  {isPlaying && !isLoading && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                  {isLoading && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-gray-400 hover:text-white p-1 rounded"
                  >
                    <Music className="h-4 w-4" />
                  </button>
                  <button
                    onClick={closePlayer}
                    className="text-gray-400 hover:text-red-400 p-1 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 text-center text-red-400 text-xs bg-red-600/20 rounded px-2 py-1">
                  {error}
                </div>
              )}

              {/* Track Info */}
              <div className="mb-3">
                {currentTrack ? (
                  <>
                    <div className="text-white font-medium text-sm truncate">{currentTrack.title}</div>
                    <div className="text-gray-400 text-xs truncate">{currentTrack.artist}</div>
                    {isLoading && <div className="text-purple-400 text-xs">Loading...</div>}
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">No background stream available</div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 rounded-full transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>

                <div className="flex items-center space-x-2 flex-1 ml-3">
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Auto-play toggle */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <label className="flex items-center space-x-2 text-xs text-gray-400">
                  <input
                    type="checkbox"
                    checked={autoPlayEnabled}
                    onChange={(e) => setAutoPlayEnabled(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-600"
                  />
                  <span>Auto-play background radio (loops continuously)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BackgroundRadioPlayer;
