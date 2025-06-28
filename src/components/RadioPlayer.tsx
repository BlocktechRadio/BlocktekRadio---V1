import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { motion } from 'framer-motion';

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Demo stream URL - replace with your actual stream
  const streamUrl = "https://stream.zeno.fm/your-stream-id"; // Replace with actual stream

  const [currentTrack] = useState({
    title: "Web3 Weekly Roundup",
    artist: "BlockTek Radio",
    album: "Crypto News & Analysis",
    artwork: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400"
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl"
    >
      <audio
        ref={audioRef}
        src={streamUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Album Artwork */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
        </div>

        {/* Track Info & Controls */}
        <div className="flex-1 text-center lg:text-left w-full">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{currentTrack.title}</h3>
          <p className="text-purple-300 mb-2 text-sm sm:text-base">{currentTrack.artist}</p>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 lg:mb-6">{currentTrack.album}</p>

          {/* Controls */}
          <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6 mb-4">
            <button className="text-gray-400 hover:text-white transition-colors p-2">
              <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <button
              onClick={togglePlay}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 sm:p-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              {isPlaying ? <Pause className="h-6 w-6 sm:h-8 sm:w-8" /> : <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-1" />}
            </button>
            
            <button className="text-gray-400 hover:text-white transition-colors p-2">
              <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
            <span className="text-xs sm:text-sm text-gray-400 min-w-[35px] sm:min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm text-gray-400 min-w-[35px] sm:min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors p-2">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 lg:w-24 accent-purple-500"
            />
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 font-semibold text-sm sm:text-base">LIVE</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RadioPlayer;