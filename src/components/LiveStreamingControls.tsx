import React from 'react';
import { Mic, Headphones, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface LiveStreamingControlsProps {
  onGoLive: () => void;
  onStartListening: () => void;
}

const LiveStreamingControls: React.FC<LiveStreamingControlsProps> = ({
  onGoLive,
  onStartListening
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8"
    >
      <Link 
        to="/dashboard"
        className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center space-x-3"
      >
        <Headphones className="h-6 w-6 group-hover:animate-pulse" />
        <span className="text-lg">Start Listening</span>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      <button
        onClick={onGoLive}
        className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 text-white px-8 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-3"
      >
        <Mic className="h-6 w-6 group-hover:animate-pulse" />
        <span className="text-lg">Go Live (Coming Soon)</span>
      </button>
    </motion.div>
  );
};

export default LiveStreamingControls;