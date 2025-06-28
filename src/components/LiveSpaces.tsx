import React, { useState } from 'react';
import { Mic, MicOff, Users, Clock, Play, Pause, Volume2, Settings, MessageCircle, Heart, Share, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

const LiveSpaces = () => {
  const { isConnected } = useAccount();
  const [isHosting, setIsHosting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);

  const liveSpaces = [
    {
      id: 1,
      title: "DeFi Deep Dive: Yield Farming Strategies",
      host: "CryptoExpert.eth",
      listeners: 234,
      duration: "45 min",
      status: "live",
      category: "DeFi",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
      description: "Join us for an in-depth discussion about the latest yield farming opportunities and risk management strategies."
    },
    {
      id: 2,
      title: "NFT Creator Spotlight: Building Your Brand",
      host: "ArtistDAO",
      listeners: 156,
      duration: "30 min",
      status: "live",
      category: "NFTs",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
      description: "Learn from successful NFT creators about building your brand and community in the Web3 space."
    },
    {
      id: 3,
      title: "Blockchain Gaming: The Future of Play-to-Earn",
      host: "GameFi.pro",
      listeners: 89,
      duration: "1h 15min",
      status: "scheduled",
      category: "Gaming",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100",
      description: "Exploring the evolution of blockchain gaming and the economic opportunities in play-to-earn ecosystems."
    }
  ];

  const handleJoinSpace = (spaceId: number) => {
    setSelectedSpace(spaceId);
  };

  const handleStartHosting = () => {
    setIsHosting(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Live Audio Spaces
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
          Join live conversations, host your own spaces, and connect with the Web3 community through AI-enhanced audio experiences
        </p>
        
        {isConnected && (
          <button
            onClick={handleStartHosting}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <Mic className="h-5 w-5" />
            <span>Start Your Space</span>
          </button>
        )}
      </div>

      {/* Live Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {liveSpaces.map((space, index) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                space.status === 'live' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {space.status === 'live' ? '🔴 LIVE' : '⏰ SCHEDULED'}
              </span>
              <span className="text-xs text-gray-400 bg-purple-500/20 px-2 py-1 rounded">
                {space.category}
              </span>
            </div>

            {/* Host Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={space.avatar}
                alt={space.host}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-purple-500/30 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base truncate">{space.host}</p>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span>{space.listeners} listening</span>
                  <Clock className="h-3 w-3 ml-2 flex-shrink-0" />
                  <span>{space.duration}</span>
                </div>
              </div>
            </div>

            {/* Space Title & Description */}
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
              {space.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 sm:mb-6 line-clamp-3">
              {space.description}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleJoinSpace(space.id)}
                disabled={space.status !== 'live'}
                className={`flex-1 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  space.status === 'live'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {space.status === 'live' ? 'Join Space' : 'Set Reminder'}
              </button>
              <button className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Share className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Space Player */}
      {selectedSpace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 bg-black/90 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-4 sm:p-6 z-50 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-semibold text-sm sm:text-base truncate">
                  {liveSpaces.find(s => s.id === selectedSpace)?.title}
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm truncate">
                  Hosted by {liveSpaces.find(s => s.id === selectedSpace)?.host}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSpace(null)}
              className="text-gray-400 hover:text-white p-2 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 sm:p-3 rounded-full transition-all ${
                  isMuted 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              <button className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
              <button className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                className="w-16 sm:w-20 accent-purple-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Host Space Modal */}
      {isHosting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Start Your Space</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Space Title</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none text-sm sm:text-base"
                  placeholder="Enter your space title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none text-sm sm:text-base">
                  <option value="defi">DeFi</option>
                  <option value="nft">NFTs</option>
                  <option value="gaming">Gaming</option>
                  <option value="education">Education</option>
                  <option value="general">General Discussion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none text-sm sm:text-base"
                  placeholder="Describe what you'll be discussing..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsHosting(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all">
                Go Live
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Voice Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 sm:p-8"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">AI-Powered Voice Stack</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Experience crystal-clear audio with our advanced AI voice processing technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              title: "Noise Cancellation",
              description: "Advanced AI removes background noise for crystal-clear conversations",
              icon: "🎯"
            },
            {
              title: "Voice Enhancement",
              description: "Real-time voice optimization for professional-quality audio",
              icon: "🎤"
            },
            {
              title: "Live Translation",
              description: "Break language barriers with real-time voice translation",
              icon: "🌍"
            }
          ].map((feature, index) => (
            <div key={index} className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
              <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LiveSpaces;