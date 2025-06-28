import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

const CryptoPrices = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
        );
        setCryptoData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch crypto data');
        setLoading(false);
        // Fallback data for demo
        setCryptoData([
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            current_price: 43250.00,
            price_change_percentage_24h: 2.5,
            market_cap: 847000000000,
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
          },
          {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            current_price: 2650.00,
            price_change_percentage_24h: -1.2,
            market_cap: 318000000000,
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
          }
        ]);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-3 sm:p-4 animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 sm:h-6 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 sm:h-4 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 min-w-max lg:min-w-0">
        {cryptoData.map((crypto, index) => (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all min-w-[140px] sm:min-w-0"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32/6366f1/ffffff?text=' + crypto.symbol;
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-xs sm:text-sm truncate">{crypto.symbol.toUpperCase()}</div>
                <div className="text-xs text-gray-400 truncate">{crypto.name}</div>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-sm sm:text-lg font-bold text-white">
                ${crypto.current_price.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {crypto.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
              )}
              <span
                className={`text-xs sm:text-sm font-medium ${
                  crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>

            <div className="text-xs text-gray-500 mt-2 truncate">
              MCap: ${(crypto.market_cap / 1e9).toFixed(1)}B
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CryptoPrices;