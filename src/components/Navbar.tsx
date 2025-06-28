import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Radio, Wallet, Menu, X, ChevronDown, Home, Info, Zap, Calendar, Users, Phone } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home, action: () => scrollToSection('home') },
    { name: 'About Us', href: '#about', icon: Info, action: () => scrollToSection('about') },
    { name: 'Features', href: '#features', icon: Zap, action: () => scrollToSection('features') },
    { name: 'Roadmap', href: '#roadmap', icon: Calendar, action: () => scrollToSection('roadmap') },
    { name: 'Live Spaces', href: '#live-spaces', icon: Radio, action: () => scrollToSection('live-spaces') },
    { name: 'Community', href: '#social', icon: Users, action: () => scrollToSection('social') },
    { name: 'Contact', href: '#contact', icon: Phone, action: () => scrollToSection('contact') },
    { name: 'Dashboard', href: '/dashboard', icon: Zap, action: null },
    { name: 'Mint NFT', href: '/mint', icon: Zap, action: null },
    { name: 'Education', href: '/education', icon: Zap, action: null },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleConnect = () => {
    const metamaskConnector = connectors.find(connector => connector.name === 'MetaMask');
    if (metamaskConnector) {
      connect({ connector: metamaskConnector });
    }
  };

  const handleNavigation = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.href.startsWith('/')) {
      window.location.href = item.href;
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BlockTek Radio
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                {navigation.slice(0, 7).map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className="text-sm font-medium text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 px-3 py-2 rounded-lg transition-all"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Wallet + Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Wallet Connection */}
              {isConnected ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="hidden sm:block text-xs sm:text-sm text-gray-300 bg-purple-500/10 px-2 sm:px-3 py-1 rounded-lg border border-purple-500/20">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 shadow-lg"
                >
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-purple-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-l border-purple-500/30 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                      <Radio className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      BlockTek Radio
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-purple-500/10 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {navigation.map((item, index) => (
                    <motion.button
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavigation(item)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-medium transition-all text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Mobile Wallet Status */}
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20"
                  >
                    <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
                    <p className="text-sm text-purple-300 font-mono break-all">
                      {address}
                    </p>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 space-y-3"
                >
                  <p className="text-xs text-gray-500 px-4 mb-3">Quick Actions</p>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      scrollToSection('live-spaces');
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Radio className="h-4 w-4" />
                    <span>Go Live Now</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      scrollToSection('features');
                    }}
                    className="w-full border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Start Listening</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;