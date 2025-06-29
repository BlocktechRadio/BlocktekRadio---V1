# BlockTek Radio - Blockchain Internet Radio Platform MVP

A comprehensive Web3-powered internet radio platform that combines audio streaming, NFT minting, token rewards, and educational content in a beautiful, modern interface.

## 🚀 Features

### Core Functionality
- **Web3 Wallet Integration**: Connect with MetaMask, WalletConnect, and other major wallets
- **Live Radio Streaming**: High-quality audio streaming with modern player controls
- **NFT Music Minting**: Create and mint audio NFTs with royalty management
- **Token Rewards System**: Earn BTK tokens for listening and creating content
- **Token-Gated Content**: Premium content accessible via NFT/token ownership
- **Live Crypto Prices**: Real-time cryptocurrency market data
- **Educational Hub**: Curated Web3 learning content with access controls

### Smart Contracts
- **BlockTekToken (BTK)**: ERC-20 reward token with listening/creator incentives
- **BlockTekNFT**: ERC-721 music NFT contract with royalty support
- **AccessControl**: Token-gated content management system

### Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Web3**: Wagmi, Viem, Ethers.js
- **Backend**: Node.js, Express, IPFS integration
- **Blockchain**: Multi-chain support (Ethereum, Polygon, Arbitrum, CoreDAO)
- **Smart Contracts**: Solidity 0.8.19, OpenZeppelin, Hardhat

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet

### 1. Clone and Install
```bash
git clone <repository-url>
cd blocktek-radio
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Required for blockchain functionality
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional: IPFS file uploads
INFURA_PROJECT_SECRET=your_infura_project_secret
```

### 3. Start Development Environment

**Frontend Development:**
```bash
npm run dev
```

**Backend Server:**
```bash
npm run server
```

**Local Blockchain (optional):**
```bash
npx hardhat node
```

## 📋 Smart Contract Deployment

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npm run deploy:localhost
```

### Testnet Deployment
```bash
# Sepolia (Ethereum)
npm run deploy:sepolia

# Mumbai (Polygon)
npm run deploy:mumbai

# CoreDAO Testnet
npm run deploy:core
```

### Contract Verification
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🎯 Usage Guide

### For Listeners
1. **Connect Wallet**: Click "Connect Wallet" in the navigation
2. **Start Listening**: Use the radio player on the home page
3. **Earn Rewards**: Accumulate BTK tokens while listening
4. **Access Premium**: Use tokens/NFTs for exclusive content
5. **View Dashboard**: Track stats, rewards, and NFT collection

### For Creators
1. **Connect Wallet**: Ensure wallet connection
2. **Mint NFTs**: Navigate to "Mint NFT" page
3. **Upload Content**: Add audio files and metadata
4. **Set Pricing**: Configure price and royalty percentages
5. **Deploy**: Mint your NFT to the blockchain

### For Developers
1. **Smart Contracts**: Located in `/contracts/`
2. **API Endpoints**: Backend routes in `/server/index.js`
3. **Frontend Components**: React components in `/src/components/`
4. **Web3 Integration**: Wagmi configuration in `/src/config/`

## 🔧 API Endpoints

### Backend Routes
- `GET /api/health` - Health check
- `POST /api/upload` - IPFS file upload
- `GET /api/crypto-prices` - Live cryptocurrency prices
- `GET /api/stream/:contentId` - Audio streaming
- `GET /api/education` - Educational content
- `POST /api/analytics/listening` - Listening analytics
- `GET /api/user/:address/stats` - User statistics

### Smart Contract Functions

**BlockTekToken (BTK)**
- `claimListeningRewards()` - Claim tokens for listening
- `claimCreatorRewards()` - Claim tokens for creating
- `recordListeningHours()` - Track user activity

**BlockTekNFT**
- `mintMusicNFT()` - Mint new music NFT
- `getNFTMetadata()` - Get NFT information
- `royaltyInfo()` - EIP-2981 royalty standard

**AccessControl**
- `hasAccess()` - Check content access permissions
- `createAccessTier()` - Define new access levels
- `registerContent()` - Add token-gated content

## 🌐 Multi-Chain Support

The platform supports deployment on multiple EVM-compatible chains:

- **Ethereum**: Mainnet and Sepolia testnet
- **Polygon**: Mainnet and Mumbai testnet  
- **Arbitrum**: Mainnet and testnet
- **Optimism**: Mainnet and testnet
- **CoreDAO**: Mainnet and testnet

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first, works on all devices
- **Dark Theme**: Modern Web3 aesthetic with gradient accents
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Elements**: Hover states and micro-interactions
- **Accessibility**: WCAG compliant design patterns
- **Loading States**: Skeleton screens and progress indicators

## 🔐 Security Features

- **Smart Contract Security**: OpenZeppelin standards
- **Access Control**: Role-based permissions
- **Input Validation**: Frontend and backend validation
- **Rate Limiting**: API endpoint protection
- **Secure File Upload**: IPFS integration with validation
- **Wallet Security**: Non-custodial Web3 integration

## 📊 Analytics & Monitoring

- **User Analytics**: Listening time, engagement metrics
- **Token Economics**: Reward distribution tracking
- **NFT Metrics**: Minting and trading statistics
- **Performance Monitoring**: API response times
- **Error Tracking**: Comprehensive error logging

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Backend Deployment
```bash
# Set production environment variables
NODE_ENV=production
PORT=3001

# Start production server
npm run server
```

### Smart Contract Deployment
```bash
# Deploy to mainnet (ensure sufficient funds)
npm run deploy:mainnet
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Community**: Join our Discord for discussions
- **Email**: Contact team@blocktekradio.com

## 🗺 Roadmap

### Phase 1 (Current MVP)
- ✅ Basic radio streaming
- ✅ Wallet integration
- ✅ NFT minting
- ✅ Token rewards
- ✅ Educational content

### Phase 2 (Next Release)
- 🔄 Live streaming for creators
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app development
- 🔄 Social features and chat
- 🔄 Governance token functionality

### Phase 3 (Future)
- 📋 Cross-chain bridge integration
- 📋 AI-powered content recommendations
- 📋 Virtual concert hosting
- 📋 Creator monetization tools
- 📋 Enterprise partnerships

---

**Built with ❤️ for the Web3 community**

*BlockTekRadio - Where Blockchain Meets Audio*
