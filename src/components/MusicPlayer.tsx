import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Track {
  id: number;
  title: string;
  artist: string;
  filename: string;
  duration: number;
}

const MusicPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to backend with explicit configuration
    socketRef.current = io('https://blocktekradio-v1.onrender.com', {
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true
    });
    
    // Connection event listeners
    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully:', socketRef.current?.id);
      setError(null);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to server. Audio may not sync properly.');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setError('Connection lost. Attempting to reconnect...');
    });

    // Socket event listeners
    socketRef.current.on('trackChanged', (track: Track) => {
      console.log('Track changed:', track);
      setCurrentTrack(track);
      setError(null);
      
      if (track && audioRef.current) {
        setIsLoading(true);
        const audioUrl = `https://blocktekradio-v1.onrender.com/api/stream/audio/${track.filename}`;
        console.log('Loading audio from:', audioUrl);
        
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        // Don't auto-play, wait for user interaction
        const handleLoadedData = () => {
          console.log('Audio loaded, ready to play');
          setIsLoading(false);
          setError('Click play to start audio');
        };
        
        const handleLoadError = (e: any) => {
          console.error('Audio loading error:', e);
          setError('Failed to load audio');
          setIsLoading(false);
        };
        
        audioRef.current.addEventListener('loadeddata', handleLoadedData, { once: true });
        audioRef.current.addEventListener('error', handleLoadError, { once: true });
      }
    });

    socketRef.current.on('playStateChanged', ({ isPlaying: playing }: { isPlaying: boolean }) => {
      console.log('Play state changed:', playing);
      setIsPlaying(playing);
      
      if (audioRef.current && currentTrack) {
        if (playing) {
          playAudio();
        } else {
          audioRef.current.pause();
        }
      }
    });

    socketRef.current.on('playlistUpdated', (newPlaylist: Track[]) => {
      console.log('Playlist updated:', newPlaylist);
      setPlaylist(newPlaylist);
    });

    // Get initial state
    fetch('https://blocktekradio-v1.onrender.com/api/stream/status')
      .then(res => res.json())
      .then(data => {
        console.log('Initial state:', data);
        setCurrentTrack(data.currentTrack);
        setIsPlaying(data.isPlaying);
        setPlaylist(data.playlist);
        
        if (data.currentTrack && audioRef.current) {
          const audioUrl = `https://blocktekradio-v1.onrender.com/api/stream/audio/${data.currentTrack.filename}`;
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          
          // If currently playing, try to start audio
          if (data.isPlaying) {
            setTimeout(() => {
              playAudio();
            }, 1000);
          }
        }
      })
      .catch(error => {
        console.error('Failed to get initial state:', error);
        setError('Failed to connect to server');
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    
    const handleCanPlay = () => {
      console.log('Audio can play');
      setIsLoading(false);
      updateDuration();
    };
    
    const handleError = (e: any) => {
      console.error('Audio error:', e);
      setError('Audio playback error');
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack]);

  const playAudio = async () => {
    if (audioRef.current) {
      try {
        // Ensure user interaction for autoplay policy
        if (audioRef.current.currentTime === 0 || audioRef.current.currentTime === audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        
        // Set volume
        audioRef.current.volume = volume;
        
        // Create audio context if needed
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
              console.log('Audio context resumed for music player');
            }
            audioContext.close();
          } catch (audioContextError) {
            console.warn('Audio context setup failed:', audioContextError);
          }
        }
        
        await audioRef.current.play();
        console.log('Music player audio playing successfully');
        setError(null);
      } catch (error: any) {
        console.error('Music player play failed:', error);
        
        // Provide user-friendly error messages
        if (error.name === 'NotAllowedError') {
          setError('Audio blocked by browser. Click play to enable audio.');
        } else if (error.name === 'NotSupportedError') {
          setError('Audio format not supported by your browser');
        } else if (error.name === 'AbortError') {
          setError('Audio loading was interrupted. Click play to retry.');
        } else {
          setError('Audio playback failed. Click play to try again.');
        }
      }
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!currentTrack) {
        setError('No track selected');
        return;
      }

      if (isPlaying) {
        // Pause locally first for immediate feedback
        if (audioRef.current) {
          audioRef.current.pause();
        }
        await fetch('https://blocktekradio-v1.onrender.com/api/stream/pause', { method: 'POST' });
      } else {
        // Play locally first for immediate feedback
        await playAudio();
        await fetch('https://blocktekradio-v1.onrender.com/api/stream/resume', { method: 'POST' });
      }
    } catch (error) {
      console.error('Failed to toggle play/pause:', error);
      setError('Failed to control playback');
    }
  };

  // Force play function for user interaction
  const forcePlay = async () => {
    if (currentTrack && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setError(null);
        setIsPlaying(true);
        
        // Notify server
        await fetch('https://blocktekradio-v1.onrender.com/api/stream/resume', { method: 'POST' });
      } catch (error) {
        console.error('Force play failed:', error);
        setError('Unable to play audio. Please check your browser settings.');
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          No track playing - Visit admin panel to upload music or select a track from the stream list
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-purple-500/20 p-4 z-50">
      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
        controls={false}
      />
      
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-2 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <span className="mr-2">⚠️</span>
              {error}
              {(error.includes('Click play') || error.includes('blocked by browser')) && (
                <button
                  onClick={forcePlay}
                  className="ml-3 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                >
                  Enable Audio
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <span className="text-white font-bold">♪</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-white font-medium truncate">{currentTrack.title}</div>
              <div className="text-gray-400 text-sm truncate">{currentTrack.artist}</div>
              {isLoading && <div className="text-purple-400 text-xs">Loading...</div>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-400 hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button 
              onClick={togglePlayPause}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-full transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            
            <button 
              className="text-gray-400 hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Progress & Volume */}
          <div className="flex items-center space-x-4 min-w-0 flex-1 justify-end">
            <div className="flex items-center space-x-2 min-w-0 flex-1 max-w-md">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                disabled={isLoading || !duration}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
