import React, { useState } from 'react';
import { Upload, Music, Coins, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

const NFTMinting = () => {
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    royalty: '10',
    category: 'music'
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mintingStep, setMintingStep] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        setAudioFile(file);
      } else {
        setCoverImage(file);
      }
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!audioFile || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    // Simulate minting process
    const steps = [
      'Uploading to IPFS...',
      'Creating metadata...',
      'Deploying smart contract...',
      'Minting NFT...',
      'Finalizing transaction...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setMintingStep(i);
      toast.loading(steps[i], { id: 'minting' });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    toast.success('NFT minted successfully!', { id: 'minting' });
    setIsUploading(false);
    setMintingStep(0);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      price: '',
      royalty: '10',
      category: 'music'
    });
    setAudioFile(null);
    setCoverImage(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">Please connect your wallet to start minting NFTs</p>
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8">
            <div className="text-4xl sm:text-6xl mb-4">🎵</div>
            <p className="text-gray-300 text-sm sm:text-base">Transform your audio content into valuable NFTs!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Mint Your Audio NFT
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            Transform your audio content into valuable blockchain assets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-purple-400" />
              Upload Files
            </h3>

            {/* Audio Upload */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio File *
              </label>
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4 sm:p-6 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'audio')}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  {audioFile ? (
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm sm:text-base truncate">{audioFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Music className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm sm:text-base">Click to upload audio file</p>
                      <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC up to 100MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4 sm:p-6 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {coverImage ? (
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm sm:text-base truncate">{coverImage.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm sm:text-base">Click to upload cover image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <Coins className="h-5 w-5 mr-2 text-yellow-400" />
              NFT Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none text-sm sm:text-base"
                  placeholder="Enter NFT title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none text-sm sm:text-base"
                  placeholder="Describe your audio NFT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.001"
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none text-sm sm:text-base"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Royalty (%)
                </label>
                <select
                  name="royalty"
                  value={formData.royalty}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none text-sm sm:text-base"
                >
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none text-sm sm:text-base"
                >
                  <option value="music">Music</option>
                  <option value="podcast">Podcast</option>
                  <option value="educational">Educational</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Minting Progress */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Minting Progress</h3>
            <div className="space-y-3">
              {['Upload to IPFS', 'Create Metadata', 'Deploy Contract', 'Mint NFT', 'Finalize'].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index < mintingStep ? 'bg-green-500' :
                    index === mintingStep ? 'bg-purple-500 animate-pulse' :
                    'bg-gray-600'
                  }`}>
                    {index < mintingStep ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm sm:text-base ${
                    index <= mintingStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mint Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <button
            onClick={handleMint}
            disabled={isUploading || !audioFile || !formData.title}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
          >
            {isUploading ? 'Minting...' : 'Mint NFT'}
          </button>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Estimated gas fee: ~$15-25
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTMinting;