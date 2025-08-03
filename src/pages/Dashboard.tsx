import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Headphones, Coins, Trophy, Music, TrendingUp, Users, Wallet, ExternalLink, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import MusicPlayer from '../components/MusicPlayer';

interface Track {
  id: number;
  title: string;
  artist: string;
  filename: string;
  duration: number;
  uploadedAt: string;
  play_count: number;
}

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [userStats, setUserStats] = useState({
    listeningHours: 0,
    tokensEarned: 0,
    nftsOwned: 0,
    rank: 0,
    streaksDay: 0
  });

  const [availableStreams, setAvailableStreams] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [recentActivity] = useState([
    { type: 'listen', description: 'Listened to "DeFi Deep Dive"', time: '2 hours ago', tokens: 25 },
    { type: 'mint', description: 'Minted "Crypto Beats #123"', time: '1 day ago', tokens: 0 },
    { type: 'reward', description: 'Daily listening bonus', time: '1 day ago', tokens: 50 },
    { type: 'listen', description: 'Listened to "NFT News Weekly"', time: '2 days ago', tokens: 30 },
  ]);

  useEffect(() => {
    if (isConnected && address) {
      connectUser();
      loadAvailableStreams();
    }
  }, [isConnected, address]);

  const connectUser = async () => {
    try {
      const response = await fetch('https://blocktek-radio-v1.vercel.app/api/users/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          username: null,
          email: null
        }),
      });

      const result = await response.json();
      if (result.success) {
        setUserStats({
          listeningHours: result.user.listening_hours || 0,
          tokensEarned: result.user.tokens_earned || 0,
          nftsOwned: result.user.nfts_owned || 0,
          rank: result.user.rank_position || 999,
          streaksDay: result.user.streak_days || 0
        });
      }
    } catch (error) {
      console.error('Failed to connect user:', error);
    }
  };

  const loadAvailableStreams = async () => {
    try {
      const response = await fetch('https://blocktek-radio-v1.vercel.app/api/admin/playlist');
      const tracks = await response.json();
      setAvailableStreams(tracks);
    } catch (error) {
      console.error('Failed to load streams:', error);
    }
  };

  const playStream = async (trackId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://blocktek-radio-v1.vercel.app/api/stream/play/${trackId}`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        setCurrentTrack(result.track);
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
        successDiv.textContent = `Now Playing: ${result.track.title}`;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          successDiv.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to play stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">Please connect your wallet to access your dashboard and start earning tokens</p>
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8">
            <div className="text-4xl sm:text-6xl mb-6">🔒</div>
            <p className="text-gray-300 text-sm sm:text-base mb-6">Your personalized Web3 radio experience awaits!</p>
            
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Connect {connector.name}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="https://blocktek-radio-v1.vercel.app/admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                <span>Admin Panel</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-24 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400 text-sm sm:text-base">Welcome back to BlockTek Radio</p>
              <div className="text-xs sm:text-sm text-purple-400 mt-2 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="https://blocktek-radio-v1.vercel.app/admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
              >
                <Music className="h-4 w-4" />
                <span>Admin Panel</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              
              <button
                onClick={() => disconnect()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Headphones className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{userStats.listeningHours}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Hours Listened</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-pink-400" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{userStats.tokensEarned.toLocaleString()}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">BTK Tokens</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Music className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{userStats.nftsOwned}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">NFTs Owned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">#{userStats.rank}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Global Rank</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{userStats.streaksDay}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Day Streak</div>
          </motion.div>
        </div>

        {/* Available Streams Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-6 sm:mb-8 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6 flex items-center">
            <Music className="h-6 w-6 mr-3 text-purple-400" />
            Available Streams
          </h3>
          
          {availableStreams.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No streams available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableStreams.slice(0, 6).map((track) => (
                <div
                  key={track.id}
                  className={`bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer ${
                    currentTrack?.id === track.id ? 'border-green-500 bg-green-600/10' : 'border-purple-500/20'
                  }`}
                  onClick={() => playStream(track.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playStream(track.id);
                      }}
                      disabled={isLoading}
                      className={`p-2 text-white rounded-full transition-colors ${
                        currentTrack?.id === track.id 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  <h4 className="text-white font-medium mb-1 text-sm truncate">{track.title}</h4>
                  <p className="text-gray-400 text-xs mb-2">by {track.artist}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(track.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Headphones className="h-3 w-3" />
                      <span>{track.play_count || 0}</span>
                    </div>
                  </div>
                  
                  {currentTrack?.id === track.id && (
                    <div className="mt-2 flex items-center text-green-400 text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      Now Playing
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {availableStreams.length > 6 && (
            <div className="text-center mt-6">
              <button className="text-purple-400 hover:text-purple-300 font-medium">
                View All Streams ({availableStreams.length}) →
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              Recent Activity
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'listen' ? 'bg-blue-400' :
                      activity.type === 'mint' ? 'bg-purple-400' :
                      'bg-green-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-xs sm:text-sm font-medium truncate">{activity.description}</div>
                      <div className="text-gray-400 text-xs">{activity.time}</div>
                    </div>
                  </div>
                  {activity.tokens > 0 && (
                    <div className="text-green-400 text-xs sm:text-sm font-medium flex-shrink-0">+{activity.tokens} BTK</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Token Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <Coins className="h-5 w-5 mr-2 text-yellow-400" />
              Token Rewards
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium text-sm sm:text-base">Daily Listening Bonus</span>
                  <span className="text-green-400 font-bold text-sm sm:text-base">+50 BTK</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">3 hours left</div>
              </div>

              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium text-sm sm:text-base">Weekly Challenge</span>
                  <span className="text-cyan-400 font-bold text-sm sm:text-base">+200 BTK</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Listen to 5 more shows</div>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all text-sm sm:text-base">
                Claim Available Rewards
              </button>
            </div>
          </motion.div>
        </div>

        {/* NFT Collection Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
            <Music className="h-5 w-5 mr-2 text-purple-400" />
            Your NFT Collection
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-3 sm:p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer">
                <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                  <Music className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-purple-400 hover:text-purple-300 font-medium text-sm sm:text-base">
              View Full Collection →
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
};

export default Dashboard;