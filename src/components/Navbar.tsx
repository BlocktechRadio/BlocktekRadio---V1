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
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home, action: () => scrollToSection('home') },
    { name: 'About Us', href: '#about', icon: Info, action: () => scrollToSection('about') },
    { name: 'Features', href: '#features', icon: Zap, action: () => scrollToSection('features') },
    { name: 'Dashboard', href: '/dashboard', icon: Users },
    { name: 'Contact', href: '#contact', icon: Phone, action: () => scrollToSection('contact') },
  ];

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleConnect = (connector: any) => {
    connect({ connector });
    setShowWalletMenu(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">BlockTek Radio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.href.startsWith('#') ? (
                  <button
                    onClick={item.action}
                    className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-purple-500/20 rounded-lg shadow-lg"
                    >
                      <div className="p-2">
                        <button
                          onClick={handleDisconnect}
                          className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded transition-colors"
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900 border border-purple-500/20 rounded-lg shadow-lg"
                    >
                      <div className="p-2">
                        {connectors.map((connector) => (
                          <button
                            key={connector.id}
                            onClick={() => handleConnect(connector)}
                            className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded transition-colors flex items-center space-x-2"
                          >
                            <Wallet className="h-4 w-4" />
                            <span>Connect {connector.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-purple-500/20"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.href.startsWith('#') ? (
                      <button
                        onClick={item.action}
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors w-full text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile Wallet Section */}
                <div className="border-t border-purple-500/20 pt-3 mt-3">
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-gray-400 text-sm">
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                      <button
                        onClick={handleDisconnect}
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connectors.map((connector) => (
                        <button
                          key={connector.id}
                          onClick={() => handleConnect(connector)}
                          className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                          Connect {connector.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;