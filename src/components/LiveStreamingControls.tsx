import React, { useState } from 'react';
import { Mic, MicOff, Radio, Users, Volume2, VolumeX, Play, Pause, Settings, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useAudioStreaming } from '../hooks/useAudioStreaming';
import toast from 'react-hot-toast';

interface LiveStreamingControlsProps {
  onGoLive?: () => void;
  onStartListening?: () => void;
}

const LiveStreamingControls: React.FC<LiveStreamingControlsProps> = ({
  onGoLive,
  onStartListening
}) => {
  const { isConnected } = useAccount();
  const {
    streamState,
    startBroadcast,
    stopBroadcast,
    startListening,
    stopListening,
    volume,
    setVolume,
    error
  } = useAudioStreaming();

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  const handleGoLive = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to go live');
      return;
    }
    setShowBroadcastModal(true);
    onGoLive?.();
  };

  const handleStartBroadcast = async () => {
    if (!streamTitle.trim()) {
      toast.error('Please enter a stream title');
      return;
    }
    
    await startBroadcast(streamTitle);
    setShowBroadcastModal(false);
    setStreamTitle('');
  };

  const handleStartListening = () => {
    startListening();
    onStartListening?.();
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 0.7 : 0);
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="flex justify-center mb-4">
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          streamState.isConnected 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {streamState.isConnected ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Live Streaming Ready</span>
            </>
          ) : (
            <>
              <Radio className="h-4 w-4" />
              <span>Demo Mode Active</span>
            </>
          )}
        </div>
      </div>

      {/* Demo Mode Info */}
      {streamState.isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Demo Mode</span>
          </div>
          <p className="text-blue-300 text-sm">
            Live streaming server is unavailable. All features work in demonstration mode with simulated data.
          </p>
        </motion.div>
      )}

      {/* Main Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
        {/* Go Live Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={streamState.isRecording ? stopBroadcast : handleGoLive}
          className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all flex items-center justify-center space-x-2 shadow-2xl ${
            streamState.isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          }`}
        >
          {streamState.isRecording ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
              <Users className="h-5 w-5" />
              <span>{streamState.currentListeners}</span>
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>{streamState.isDemoMode ? 'Demo Broadcast' : 'Go Live Now'}</span>
            </>
          )}
        </motion.button>

        {/* Start Listening Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={streamState.isListening ? stopListening : handleStartListening}
          className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
            streamState.isListening
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10'
          }`}
        >
          {streamState.isListening ? (
            <>
              <Pause className="h-5 w-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Radio className="h-5 w-5" />
              <span>{streamState.isDemoMode ? 'Demo Stream' : 'Start Listening'}</span>
            </>
          )}
        </motion.button>

        {/* Volume Control */}
        {streamState.isListening && (
          <div className="relative">
            <button
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5 text-gray-400" />
              ) : (
                <Volume2 className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {showVolumeControl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-lg border border-purple-500/30 rounded-lg p-4 min-w-[200px] z-10"
                >
                  <div className="flex items-center space-x-3">
                    <button onClick={toggleMute}>
                      {volume === 0 ? (
                        <VolumeX className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-xs text-gray-400 min-w-[30px]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Live Stream Status */}
      <AnimatePresence>
        {(streamState.isLive || streamState.isListening) && !streamState.isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 bg-gradient-to-r from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-semibold">
                {streamState.isDemoMode ? 'DEMO STREAM' : 'LIVE NOW'}
              </span>
            </div>
            <h3 className="text-white font-medium mb-1">{streamState.streamTitle}</h3>
            <p className="text-gray-400 text-sm">
              {streamState.streamerName} • {streamState.currentListeners} listeners
            </p>
            {streamState.isDemoMode && (
              <p className="text-blue-400 text-xs mt-2">
                🎭 Simulated content - live streaming unavailable
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Status */}
      <AnimatePresence>
        {streamState.isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 bg-gradient-to-r from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div>
                  <h3 className="text-white font-medium">{streamState.streamTitle}</h3>
                  <p className="text-gray-400 text-sm">
                    {streamState.isDemoMode ? 'Demo broadcast active' : 'You are live'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{streamState.currentListeners}</span>
                </div>
                <button
                  onClick={stopBroadcast}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  End Stream
                </button>
              </div>
            </div>
            {streamState.isDemoMode && (
              <div className="mt-3 text-center">
                <p className="text-blue-400 text-xs">
                  🎭 Demo mode - audio not being streamed to real listeners
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Setup Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                {streamState.isDemoMode ? 'Start Demo Broadcast' : 'Start Live Broadcast'}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stream Title
                  </label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your stream title"
                    maxLength={100}
                  />
                </div>
                
                <div className={`border rounded-lg p-3 ${
                  streamState.isDemoMode 
                    ? 'bg-blue-600/20 border-blue-500/30' 
                    : 'bg-green-600/20 border-green-500/30'
                }`}>
                  <p className={`text-sm ${
                    streamState.isDemoMode ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {streamState.isDemoMode ? (
                      <>
                        <strong>Demo Mode:</strong> Your broadcast will be simulated with realistic listener counts and interactions.
                      </>
                    ) : (
                      <>
                        <strong>Live Streaming Ready:</strong> Your broadcast will be streamed live to listeners.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartBroadcast}
                  disabled={!streamTitle.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all"
                >
                  {streamState.isDemoMode ? 'Start Demo' : 'Go Live'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveStreamingControls;