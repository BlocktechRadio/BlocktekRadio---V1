require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    
    // Ethereum Mainnet
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    
    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    
    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || 'https://polygon-mumbai.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    
    // CoreDAO Mainnet
    core: {
      url: 'https://rpc.coredao.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1116
    },
    
    // CoreDAO Testnet
    coreTestnet: {
      url: 'https://rpc.test.btcs.network',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1115
    },
    
    // Arbitrum One
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || 'https://arbitrum-mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    
    // Optimism
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || 'https://optimism-mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY
    }
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  }
};