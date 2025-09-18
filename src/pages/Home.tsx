import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, TrendingUp, Users, Headphones, Mic, Radio, MessageCircle, Phone, Mail, MapPin, Twitter, Github, Linkedin, Instagram, Youtube, Calendar, Award, Globe, Zap, Shield, Heart, ArrowRight, Star, CheckCircle, ExternalLink, Target, Rocket, Building, Code, Coins, Network, Settings, Database, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CryptoPrices from '../components/CryptoPrices';
import RadioPlayer from '../components/RadioPlayer';
import LiveSpaces from '../components/LiveSpaces';
import SocialMedia from '../components/SocialMedia';
import LiveStreamingControls from '../components/LiveStreamingControls';
import WhitepaperDownload from '../components/WhitepaperDownload';
import StreamList from '../components/StreamList';

const Home = () => {
  // Realistic stats for a startup
  const [stats] = useState({
    listeners: 247,
    creators: 18,
    nftsMinted: 42,
    liveSpaces: 8
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartListening = () => {
    scrollToSection('features');
    setIsPlaying(true);
  };

  const handleGoLive = () => {
    scrollToSection('live-spaces');
  };

  const handleJoinCommunity = () => {
    scrollToSection('social');
  };

  const handleContactUs = () => {
    scrollToSection('contact');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced for MVP */}
      <section id="home" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 mt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2" />
                World's First Decentralized Internet Radio Platform
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                BlockTek Radio
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed"
            >
              Revolutionizing Audio Through Blockchain Technology
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base sm:text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Stream Web3 content, host live discussions, mint audio NFTs, and build community 
              through blockchain-powered radio experiences. Join the audio revolution where creators 
              own their content and listeners earn rewards.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-16"
            >
              <LiveStreamingControls 
                onGoLive={handleGoLive}
                onStartListening={handleStartListening}
              />
            </motion.div>

            {/* Replace demo streams section with actual StreamList */}
            <StreamList />

            {/* Quick Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16"
            >
              {[
                { 
                  title: 'Mint NFTs', 
                  desc: 'Create audio NFTs', 
                  icon: Award, 
                  color: 'from-purple-500 to-pink-500',
                  action: () => window.location.href = '/mint'
                },
                { 
                  title: 'Dashboard', 
                  desc: 'Track your progress', 
                  icon: TrendingUp, 
                  color: 'from-cyan-500 to-blue-500',
                  action: () => window.location.href = '/dashboard'
                },
                { 
                  title: 'Learn Web3', 
                  desc: 'Educational content', 
                  icon: Globe, 
                  color: 'from-green-500 to-teal-500',
                  action: () => window.location.href = '/education'
                },
                { 
                  title: 'Join Community', 
                  desc: 'Connect with creators', 
                  icon: Users, 
                  color: 'from-yellow-500 to-orange-500',
                  action: handleJoinCommunity
                }
              ].map((card, index) => (
                <div
                  key={index}
                  onClick={card.action}
                  className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{card.title}</h4>
                  <p className="text-gray-400 text-sm">{card.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-24 sm:w-48 h-24 sm:h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Enhanced About Us Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Meet Our Founding Team
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
                Visionary leaders building the future of decentralized audio and Web3 community experiences
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {[
              {
                name: "Stanslaus Munyasia",
                role: "Co-Founder & CEO",
                image: "/WhatsApp Image 2025-06-28 at 11.35.53 PM.jpeg",
                bio: "Visionary blockchain entrepreneur with extensive experience in radio technology and Web3 innovation. Previously served as Africa BAT Ambassador, where he spearheaded continental expansion and conducted deep research into radio technology applications. Stan brings a unique combination of traditional media expertise and cutting-edge blockchain knowledge to revolutionize the audio industry through decentralized platforms.",
                achievements: ["Former Africa BAT Ambassador", "Radio Technology Research Expert", "8+ Years in Blockchain & Fintech"],
                social: { twitter: "https://x.com/stanmunyasia", linkedin: "https://www.linkedin.com/in/stanslaus-m-78381037/" }
              },
              {
                name: "Wycliffe Osano",
                role: "Co-Founder & BD",
                image: "/1750709962500.jpg",
                bio: "Strategic business development leader with a strong technical background in protocol development. Previously served as Technical Lead at CoreDAO, where he successfully onboarded over 600+ developers to the ecosystem. Currently working with HackQuest as Developer Relations and Community Manager where he has helped in reviewing 2000+ global hackathon projects & shortlisting, Wycliffe combines deep technical expertise with exceptional community building skills to drive BlockTek's global expansion and developer ecosystem growth.",
                achievements: ["Former Technical Lead at CoreDAO","Onboarded Ecosystem Partners to HackQuest", "Reviewed and helped in shortlisting over 2000+ Global Hackathon Projects", "Developer Relations at HackQuest"],
                social: { twitter: "https://x.com/wycl34226", linkedin: "https://www.linkedin.com/in/wycliffe-osano-oyieko-742586182/" }
              },
              {
                name: "Caleb Jephuneh",
                role: "Co-Founder & CTO",
                image: "/1734270128503.jpg",
                bio: "Highly skilled AI Engineer and full-stack development expert with exceptional talent in building scalable blockchain infrastructure. Caleb architects the technical foundation that powers BlockTek's decentralized radio platform, combining advanced AI technologies with robust smart contract development. His expertise spans machine learning, distributed systems, and Web3 protocols, ensuring BlockTek delivers cutting-edge audio experiences.",
                achievements: ["AI Engineering Specialist", "Full-Stack Development Expert", "Smart Contract Architect"],
                social: { twitter: "https://x.com/Code4jeph", linkedin: "https://www.linkedin.com/in/caleb-jephunneh-a96aa81b0/" }
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all group"
              >
                <div className="w-32 sm:w-40 h-32 sm:h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500/30 group-hover:border-purple-400/50 transition-colors">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-purple-400 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-400 mb-6 leading-relaxed text-sm">{member.bio}</p>
                
                {/* Achievements */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 text-sm">Key Achievements</h4>
                  <div className="space-y-2">
                    {member.achievements.map((achievement, idx) => (
                      <div key={idx} className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs">
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <a 
                    href={member.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href={member.social.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Company Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 sm:p-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Our Mission</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-8"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
                  BlockTek Radio was born from a simple belief: creators should own their content, 
                  and communities should be rewarded for their engagement. We're building the first 
                  truly decentralized internet radio platform where blockchain technology empowers 
                  both creators and listeners.
                </p>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
                  Our platform combines the intimacy of traditional radio with the innovation of Web3, 
                  creating spaces for meaningful audio conversations, educational content, and 
                  community-driven experiences that transcend geographical boundaries.
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {['Decentralized', 'Community-Owned', 'Creator-First', 'Reward-Based'].map((tag, index) => (
                    <span key={index} className="bg-purple-600/20 text-purple-300 px-3 sm:px-4 py-2 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  { icon: Globe, title: 'Global Reach', desc: '50+ Countries' },
                  { icon: Shield, title: 'Secure', desc: 'Blockchain Protected' },
                  { icon: Zap, title: 'Fast', desc: 'Real-time Streaming' },
                  { icon: Heart, title: 'Community', desc: 'Creator Focused' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white/10 rounded-2xl p-4 sm:p-6 mb-3 hover:bg-white/20 transition-colors">
                      <item.icon className="h-6 sm:h-8 w-6 sm:w-8 text-purple-400 mx-auto" />
                    </div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Revolutionary Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of internet radio with blockchain technology, 
              NFT integration, and AI-powered community features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Live Audio Spaces",
                description: "Host Twitter Spaces-style live audio conversations with AI voice enhancement and real-time moderation.",
                icon: Mic,
                color: "from-purple-500 to-pink-500",
                action: handleGoLive
              },
              {
                title: "NFT Music Minting",
                description: "Transform your audio content into valuable NFTs with our integrated minting platform and royalty system.",
                icon: Award,
                color: "from-pink-500 to-red-500",
                action: () => window.location.href = '/mint'
              },
              {
                title: "Token-Gated Content",
                description: "Access exclusive streams and educational content with your NFTs and community tokens.",
                icon: Shield,
                color: "from-cyan-500 to-blue-500",
                action: () => window.location.href = '/education'
              },
              {
                title: "AI Voice Stack",
                description: "Advanced AI voice processing for noise cancellation, voice enhancement, and real-time translation.",
                icon: Zap,
                color: "from-green-500 to-teal-500",
                action: handleGoLive
              },
              {
                title: "Community Rewards",
                description: "Earn BlockTek tokens for listening, creating, hosting spaces, and engaging with the community.",
                icon: Heart,
                color: "from-yellow-500 to-orange-500",
                action: () => window.location.href = '/dashboard'
              },
              {
                title: "Multi-Chain Support",
                description: "Deploy and interact across multiple blockchain networks including Ethereum, Polygon, and CoreDAO.",
                icon: Globe,
                color: "from-indigo-500 to-purple-500",
                action: handleContactUs
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={feature.action}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className={`w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                <div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Updated Comprehensive Roadmap Section */}
      <section id="roadmap" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Development Roadmap
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Our strategic plan to revolutionize decentralized audio from Q2 2025 to Q4 2026
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500"></div>

            {/* Roadmap Items */}
            <div className="space-y-12">
              {[
                {
                  quarter: "Q2 2025",
                  title: "Foundation & Infrastructure Development",
                  status: "In Progress",
                  color: "purple",
                  icon: Database,
                  items: [
                    "Complete technical architecture design",
                    "Develop core blockchain infrastructure",
                    "Build smart contract foundation",
                    "Create development environment setup",
                    "Establish security protocols and auditing",
                    "Form strategic partnerships and advisory board"
                  ]
                },
                {
                  quarter: "Q3 2025",
                  title: "MVP Launch & Core Features",
                  status: "Planned",
                  color: "pink",
                  icon: Rocket,
                  items: [
                    "Launch MVP with basic streaming functionality",
                    "Deploy smart contracts on testnet",
                    "Implement NFT minting capabilities",
                    "Launch live audio spaces feature",
                    "Onboard first 100 creators and 1,000 users",
                    "Launch community Discord and social channels"
                  ]
                },
                {
                  quarter: "Q4 2025",
                  title: "Advanced Features & Community Building",
                  status: "Planned",
                  color: "cyan",
                  icon: Building,
                  items: [
                    "Deploy on Ethereum mainnet",
                    "Implement token reward system",
                    "Launch creator monetization tools",
                    "Integrate AI voice enhancement",
                    "Advanced analytics dashboard",
                    "Partnership with major Web3 projects"
                  ]
                },
                {
                  quarter: "Q1 2026",
                  title: "Multi-Chain & Mobile Expansion",
                  status: "Planned",
                  color: "green",
                  icon: Network,
                  items: [
                    "Multi-chain deployment (Polygon, Arbitrum)",
                    "iOS and Android app development begins",
                    "Educational content marketplace",
                    "Governance token launch",
                    "Cross-platform content syndication",
                    "Reach 10,000+ active users milestone"
                  ]
                },
                {
                  quarter: "Q2 2026",
                  title: "Enterprise Solutions & Global Reach",
                  status: "Planned",
                  color: "yellow",
                  icon: Globe,
                  items: [
                    "Mobile app launch (iOS & Android)",
                    "Enterprise API for businesses",
                    "International market expansion",
                    "Advanced AI features (translation, transcription)",
                    "Virtual concert hosting platform",
                    "Creator fund establishment"
                  ]
                },
                {
                  quarter: "Q3 2026",
                  title: "Ecosystem Maturation & Innovation",
                  status: "Planned",
                  color: "indigo",
                  icon: Settings,
                  items: [
                    "Layer 2 scaling solutions implementation",
                    "Decentralized governance implementation",
                    "Third-party developer SDK release",
                    "Advanced monetization features",
                    "AI-powered content creation tools",
                    "100,000+ users milestone achievement"
                  ]
                },
                {
                  quarter: "Q4 2026",
                  title: "Platform Evolution & Future Vision",
                  status: "Planned",
                  color: "purple",
                  icon: Target,
                  items: [
                    "Metaverse integration capabilities",
                    "Advanced DAO governance structure",
                    "Global creator economy platform",
                    "Next-generation audio technologies",
                    "Strategic acquisition opportunities",
                    "IPO preparation and market evaluation"
                  ]
                }
              ].map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Node */}
                  <div className={`absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-gradient-to-r from-${phase.color}-500 to-${phase.color}-600 rounded-full border-4 border-black flex items-center justify-center z-10`}>
                    <phase.icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Content Card */}
                  <div className={`ml-16 md:ml-0 ${
                    index % 2 === 0 ? 'md:mr-8 md:ml-0' : 'md:ml-8'
                  } md:w-1/2`}>
                    <div className={`bg-gradient-to-br from-${phase.color}-900/20 to-${phase.color}-800/20 backdrop-blur-sm border border-${phase.color}-500/30 rounded-2xl p-6 sm:p-8 hover:border-${phase.color}-400/50 transition-all`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-white">{phase.quarter}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          phase.status === 'In Progress' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {phase.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-4">{phase.title}</h4>
                      <ul className="space-y-2">
                        {phase.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-2 text-gray-300">
                            <CheckCircle className={`h-4 w-4 text-${phase.color}-400 mt-0.5 flex-shrink-0`} />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Roadmap CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Join Our Journey
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Be part of the decentralized audio revolution. Follow our progress, contribute to the community, 
              and help shape the future of Web3 radio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleJoinCommunity}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Join Community
              </button>
              <button 
                onClick={handleContactUs}
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Partner With Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Spaces Section */}
      <section id="live-spaces" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <LiveSpaces />
        </div>
      </section>

      {/* Crypto Prices Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Live Crypto Market
          </h2>
          <CryptoPrices />
        </div>
      </section>

      {/* Whitepaper Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Technical Documentation
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Dive deep into our technology, architecture, and vision with our comprehensive whitepaper
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <WhitepaperDownload />
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section id="social" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SocialMedia />
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Ready to join the decentralized radio revolution? Let's connect and build the future of audio together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <select className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors">
                    <option value="">Select a topic</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="creator">Creator Onboarding</option>
                    <option value="technical">Technical Support</option>
                    <option value="investment">Investment Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    rows={5}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none transition-colors"
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Send Message</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-gray-400">hello@blocktekradio.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-cyan-600/20 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Location</p>
                      <p className="text-gray-400">Nairobi, Kenya</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-400" />
                  Availability
                </h3>
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <span className="text-green-400 font-semibold text-lg">24/7 Available</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    We're always here to help! Our global team ensures round-the-clock support for our community.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white font-medium mb-1">Support</div>
                      <div>Always Online</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white font-medium mb-1">Response</div>
                      <div>Within 2 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Join Our Community</h3>
                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                  Connect with creators, listeners, and blockchain enthusiasts building the future of decentralized audio.
                </p>
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { icon: Twitter, url: 'https://twitter.com/blocktekradio', color: 'hover:bg-blue-500/20 hover:text-blue-400' },
                    { icon: Github, url: 'https://github.com/blocktekradio', color: 'hover:bg-gray-500/20 hover:text-gray-300' },
                    { icon: Linkedin, url: 'https://linkedin.com/company/blocktekradio', color: 'hover:bg-blue-600/20 hover:text-blue-500' },
                    { icon: Youtube, url: 'https://youtube.com/@blocktekradio', color: 'hover:bg-red-500/20 hover:text-red-500' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-white/10 ${social.color} p-3 rounded-lg transition-all group flex items-center justify-center`}
                    >
                      <social.icon className="h-5 w-5 text-gray-400 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  BlockTek Radio
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md text-sm sm:text-base">
                The world's first decentralized internet radio platform. Empowering creators, 
                rewarding listeners, and building the future of Web3 audio experiences.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Twitter, url: 'https://twitter.com/blocktekradio' },
                  { icon: Github, url: 'https://github.com/blocktekradio' },
                  { icon: Linkedin, url: 'https://linkedin.com/company/blocktekradio' },
                  { icon: Youtube, url: 'https://youtube.com/@blocktekradio' }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={handleGoLive} className="hover:text-purple-400 transition-colors">Live Spaces</button></li>
                <li><Link to="/mint" className="hover:text-purple-400 transition-colors">NFT Minting</Link></li>
                <li><Link to="/dashboard" className="hover:text-purple-400 transition-colors">Token Rewards</Link></li>
                <li><Link to="/education" className="hover:text-purple-400 transition-colors">Education Hub</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-purple-400 transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('roadmap')} className="hover:text-purple-400 transition-colors">Roadmap</button></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
                <li><button onClick={handleContactUs} className="hover:text-purple-400 transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-500/20 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 BlockTek Radio. All rights reserved. Built with ❤️ for the Web3 community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
