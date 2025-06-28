import React from 'react';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const WhitepaperDownload = () => {
  const handleDownload = () => {
    // Open the whitepaper in a new window for download/print
    window.open('/whitepaper/BlockTek-Radio-Whitepaper.html', '_blank');
  };

  const handleViewOnline = () => {
    // Open the whitepaper in the same window
    window.open('/whitepaper/BlockTek-Radio-Whitepaper.html', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Technical Whitepaper
        </h3>
        <p className="text-gray-400 text-sm sm:text-base">
          Comprehensive 10-page technical documentation covering our architecture, tokenomics, and future roadmap
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-1">Pages</div>
            <div className="text-white">10 Pages</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-1">Format</div>
            <div className="text-white">PDF Ready</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-1">Version</div>
            <div className="text-white">v1.0 (Jan 2025)</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-1">Language</div>
            <div className="text-white">English</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-white font-semibold mb-3">What's Inside:</h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Executive Summary & Market Opportunity</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Detailed Technical Architecture with Flowcharts</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>AI Voice Stack & Advanced Audio Processing</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Comprehensive Tokenomics & Economic Model</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Governance Structure & Community Framework</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Development Roadmap (2025-2026)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Future Initiatives & Innovation Pipeline</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={handleDownload}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Download PDF</span>
        </button>
        <button
          onClick={handleViewOnline}
          className="flex-1 border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
        >
          <ExternalLink className="h-5 w-5" />
          <span>View Online</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Last updated: January 2025 • Version 1.0
        </p>
      </div>
    </motion.div>
  );
};

export default WhitepaperDownload;