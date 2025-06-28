import { useContract, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';

// Contract ABIs (simplified for demo - in production, import from compiled contracts)
const BLOCKTEK_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function claimListeningRewards() external',
  'function claimCreatorRewards() external',
  'function getClaimableListeningRewards(address user) view returns (uint256)',
  'function getClaimableCreatorRewards(address creator) view returns (uint256)',
  'function listeningHours(address user) view returns (uint256)',
  'function isCreator(address user) view returns (bool)',
  'event RewardsClaimed(address indexed user, uint256 amount, string rewardType)'
];

const BLOCKTEK_NFT_ABI = [
  'function mintMusicNFT(string title, string description, string audioIPFS, string imageIPFS, uint256 price, uint256 royaltyPercentage, string category) payable',
  'function getNFTMetadata(uint256 tokenId) view returns (tuple(string title, string description, string audioIPFS, string imageIPFS, address creator, uint256 price, uint256 royaltyPercentage, string category, uint256 createdAt))',
  'function getCreatorNFTs(address creator) view returns (uint256[])',
  'function totalSupply() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function mintingFee() view returns (uint256)',
  'event NFTMinted(uint256 indexed tokenId, address indexed creator, string title, uint256 price, string audioIPFS)'
];

const ACCESS_CONTROL_ABI = [
  'function hasAccess(address user, uint256 contentId) view returns (bool)',
  'function getAccessTier(uint256 tierId) view returns (tuple(uint256 tokenAmount, uint256 nftCount, bool isActive, string tierName))',
  'function getUserTierQualification(address user, uint256 tierId) view returns (bool qualifies, uint256 userTokens, uint256 userNFTs)',
  'function getActiveTiers() view returns (uint256[])'
];

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  BLOCKTEK_TOKEN: '0x0000000000000000000000000000000000000000', // Update after deployment
  BLOCKTEK_NFT: '0x0000000000000000000000000000000000000000',   // Update after deployment
  ACCESS_CONTROL: '0x0000000000000000000000000000000000000000'  // Update after deployment
};

export const useBlockTekToken = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: CONTRACT_ADDRESSES.BLOCKTEK_TOKEN,
    abi: BLOCKTEK_TOKEN_ABI,
    signerOrProvider: signer || provider
  });
  
  return contract;
};

export const useBlockTekNFT = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: CONTRACT_ADDRESSES.BLOCKTEK_NFT,
    abi: BLOCKTEK_NFT_ABI,
    signerOrProvider: signer || provider
  });
  
  return contract;
};

export const useAccessControl = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const contract = useContract({
    address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
    abi: ACCESS_CONTROL_ABI,
    signerOrProvider: signer || provider
  });
  
  return contract;
};

// Helper hooks for common contract interactions
export const useTokenBalance = (address?: string) => {
  const contract = useBlockTekToken();
  
  const getBalance = async () => {
    if (!contract || !address) return '0';
    try {
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  };
  
  return { getBalance };
};

export const useNFTData = () => {
  const contract = useBlockTekNFT();
  
  const getUserNFTs = async (address: string) => {
    if (!contract || !address) return [];
    try {
      const nftIds = await contract.getCreatorNFTs(address);
      const nfts = await Promise.all(
        nftIds.map(async (id: any) => {
          const metadata = await contract.getNFTMetadata(id);
          return {
            id: id.toString(),
            ...metadata
          };
        })
      );
      return nfts;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  };
  
  const mintNFT = async (nftData: any) => {
    if (!contract) throw new Error('Contract not available');
    
    const mintingFee = await contract.mintingFee();
    const tx = await contract.mintMusicNFT(
      nftData.title,
      nftData.description,
      nftData.audioIPFS,
      nftData.imageIPFS,
      ethers.utils.parseEther(nftData.price || '0'),
      nftData.royaltyPercentage || 1000, // 10%
      nftData.category || 'music',
      { value: mintingFee }
    );
    
    return tx;
  };
  
  return { getUserNFTs, mintNFT };
};

export const useContentAccess = () => {
  const contract = useAccessControl();
  
  const checkAccess = async (userAddress: string, contentId: number) => {
    if (!contract || !userAddress) return false;
    try {
      return await contract.hasAccess(userAddress, contentId);
    } catch (error) {
      console.error('Error checking content access:', error);
      return false;
    }
  };
  
  const getAccessTiers = async () => {
    if (!contract) return [];
    try {
      const tierIds = await contract.getActiveTiers();
      const tiers = await Promise.all(
        tierIds.map(async (id: any) => {
          const tier = await contract.getAccessTier(id);
          return {
            id: id.toString(),
            ...tier
          };
        })
      );
      return tiers;
    } catch (error) {
      console.error('Error fetching access tiers:', error);
      return [];
    }
  };
  
  return { checkAccess, getAccessTiers };
};