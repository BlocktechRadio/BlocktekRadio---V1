import React, { useState } from 'react';
import { Play, Lock, BookOpen, Clock, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

const Education = () => {
  const { isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Content' },
    { id: 'defi', name: 'DeFi' },
    { id: 'nft', name: 'NFTs' },
    { id: 'trading', name: 'Trading' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'web3', name: 'Web3' }
  ];

  const educationalContent = [
    {
      id: 1,
      title: "Introduction to DeFi: Complete Beginner's Guide",
      description: "Learn the fundamentals of Decentralized Finance and how it's revolutionizing traditional banking.",
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
      title: "NFT Creation and Marketing Masterclass",
      description: "From concept to sale - everything you need to know about creating and marketing successful NFTs.",
      duration: "1h 20min",
      category: "nft",
      instructor: "Sarah Johnson",
      rating: 4.9,
      students: 892,
      isTokenGated: true,
      requiredNFTs: 1,
      thumbnail: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Cryptocurrency Trading Psychology",
      description: "Master the mental game of crypto trading and learn to control emotions for better results.",
      duration: "35 min",
      category: "trading",
      instructor: "Mike Rodriguez",
      rating: 4.7,
      students: 2156,
      isTokenGated: false,
      thumbnail: "https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "Smart Contract Security Best Practices",
      description: "Advanced course on identifying and preventing common smart contract vulnerabilities.",
      duration: "2h 15min",
      category: "blockchain",
      instructor: "Dr. Emily Watson",
      rating: 4.9,
      students: 543,
      isTokenGated: true,
      requiredTokens: 500,
      thumbnail: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 5,
      title: "Web3 Development Fundamentals",
      description: "Build your first decentralized application with this comprehensive Web3 development course.",
      duration: "3h 45min",
      category: "web3",
      instructor: "David Kim",
      rating: 4.8,
      students: 1876,
      isTokenGated: false,
      thumbnail: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 6,
      title: "Advanced Yield Farming Strategies",
      description: "Maximize your DeFi returns with advanced yield farming techniques and risk management.",
      duration: "1h 30min",
      category: "defi",
      instructor: "Lisa Park",
      rating: 4.6,
      students: 687,
      isTokenGated: true,
      requiredNFTs: 2,
      thumbnail: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const filteredContent = selectedCategory === 'all' 
    ? educationalContent 
    : educationalContent.filter(content => content.category === selectedCategory);

  const canAccessContent = (content: any) => {
    if (!content.isTokenGated) return true;
    if (!isConnected) return false;
    // In a real app, you'd check actual NFT/token ownership here
    return true; // For demo purposes
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Web3 Education Hub
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Learn blockchain, DeFi, NFTs, and Web3 development through expert-led audio courses and tutorials
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden hover:bg-white/10 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {canAccessContent(content) ? (
                    <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 sm:p-4 rounded-full transition-all transform hover:scale-110">
                      <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-1" />
                    </button>
                  ) : (
                    <div className="bg-black/50 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full">
                      <Lock className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs sm:text-sm flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {content.duration}
                </div>

                {/* Token Gated Badge */}
                {content.isTokenGated && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Premium
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
                  {content.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">
                  {content.description}
                </p>

                {/* Instructor & Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 truncate">{content.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                    <span className="text-xs sm:text-sm text-gray-300">{content.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-gray-400 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{content.students.toLocaleString()} students</span>
                  </div>

                  {content.isTokenGated && !canAccessContent(content) && (
                    <div className="text-xs text-purple-400">
                      {content.requiredNFTs ? `${content.requiredNFTs} NFT required` : 
                       content.requiredTokens ? `${content.requiredTokens} BTK required` : 'Premium'}
                    </div>
                  )}
                </div>

                {/* Access Button */}
                <button
                  disabled={!canAccessContent(content)}
                  className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                    canAccessContent(content)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canAccessContent(content) ? 'Start Learning' : 'Unlock Required'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 sm:mt-12 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Unlock Premium Content
            </h3>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              Connect your wallet to access token-gated educational content and earn rewards while learning
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base">
              Connect Wallet
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Education;