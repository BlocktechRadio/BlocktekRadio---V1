import React from 'react';
import { Twitter, Github, Linkedin, Instagram, Youtube, MessageCircle, Users, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const SocialMedia = () => {
  const socialStats = [
    { platform: 'Twitter', followers: '25.4K', growth: '+12%', icon: Twitter, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/20' },
    { platform: 'Discord', followers: '18.2K', growth: '+8%', icon: MessageCircle, color: 'text-indigo-400', bg: 'from-indigo-500/20 to-indigo-600/20' },
    { platform: 'YouTube', followers: '12.8K', growth: '+15%', icon: Youtube, color: 'text-red-400', bg: 'from-red-500/20 to-red-600/20' },
    { platform: 'LinkedIn', followers: '8.5K', growth: '+6%', icon: Linkedin, color: 'text-blue-500', bg: 'from-blue-600/20 to-blue-700/20' }
  ];

  const communityPosts = [
    {
      platform: 'Twitter',
      author: '@BlockTekRadio',
      content: '🎉 Just hit 25K followers! Thank you to our amazing Web3 community for supporting decentralized audio. The future is here! #BlockTekRadio #Web3Audio',
      time: '2h ago',
      likes: 342,
      retweets: 89,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      platform: 'Discord',
      author: 'CryptoCreator#1234',
      content: 'Just minted my first audio NFT on BlockTek! The process was so smooth and the community feedback has been incredible. Love this platform! 🚀',
      time: '4h ago',
      likes: 156,
      retweets: 23,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      platform: 'YouTube',
      author: 'Web3AudioGuide',
      content: 'New video: "How BlockTek Radio is Revolutionizing Decentralized Audio" - Deep dive into the platform\'s features and tokenomics. Link in bio!',
      time: '1d ago',
      likes: 892,
      retweets: 234,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Join Our Community
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4">
          Connect with creators, listeners, and blockchain enthusiasts building the future of decentralized audio
        </p>
      </div>

      {/* Social Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {socialStats.map((stat, index) => (
          <motion.div
            key={stat.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bg} backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform`}
          >
            <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} mx-auto mb-3`} />
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.followers}</div>
            <div className="text-xs sm:text-sm text-gray-400 mb-2">{stat.platform}</div>
            <div className="text-xs text-green-400 font-medium">{stat.growth}</div>
          </motion.div>
        ))}
      </div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Follow Us Everywhere</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Twitter', icon: Twitter, url: '#', color: 'hover:bg-blue-500/20 hover:text-blue-400' },
            { name: 'Discord', icon: MessageCircle, url: '#', color: 'hover:bg-indigo-500/20 hover:text-indigo-400' },
            { name: 'YouTube', icon: Youtube, url: '#', color: 'hover:bg-red-500/20 hover:text-red-400' },
            { name: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:bg-blue-600/20 hover:text-blue-500' },
            { name: 'GitHub', icon: Github, url: '#', color: 'hover:bg-gray-500/20 hover:text-gray-300' }
          ].map((social, index) => (
            <a
              key={social.name}
              href={social.url}
              className={`bg-white/10 ${social.color} p-4 sm:p-6 rounded-xl text-center transition-all group`}
            >
              <social.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-400 group-hover:scale-110 transition-transform" />
              <div className="text-xs sm:text-sm font-medium text-gray-300">{social.name}</div>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Community Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Community Highlights
          </h3>
          <div className="space-y-4 sm:space-y-6">
            {communityPosts.map((post, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-purple-500/30 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-white font-medium text-sm sm:text-base truncate">{post.author}</span>
                      <span className="text-xs text-gray-400">{post.time}</span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {post.platform}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed">{post.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{post.retweets}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Community Guidelines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-400" />
              Community Guidelines
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                <span>Be respectful and inclusive to all community members</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                <span>Share valuable Web3 and audio content</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                <span>Support fellow creators and their projects</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                <span>Keep discussions relevant to blockchain and audio</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Join Our Discord</h3>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Get real-time updates, participate in AMAs, and connect directly with the BlockTek team and community.
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Join Discord Server</span>
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Stay updated with the latest features, partnerships, and community events.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none text-sm sm:text-base"
              />
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialMedia;