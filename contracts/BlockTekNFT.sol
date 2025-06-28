// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BlockTekNFT
 * @dev ERC721 NFT contract for BlockTek Radio music and content
 */
contract BlockTekNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Royalty info
    struct RoyaltyInfo {
        address recipient;
        uint256 percentage; // Basis points (e.g., 1000 = 10%)
    }
    
    // NFT metadata
    struct NFTMetadata {
        string title;
        string description;
        string audioIPFS;
        string imageIPFS;
        address creator;
        uint256 price;
        uint256 royaltyPercentage;
        string category;
        uint256 createdAt;
    }
    
    // Mappings
    mapping(uint256 => RoyaltyInfo) private _royalties;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public creatorNFTs;
    mapping(string => bool) public usedIPFSHashes;
    
    // Constants
    uint256 public constant MAX_ROYALTY = 2000; // 20% max royalty
    uint256 public mintingFee = 0.01 ether;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        uint256 price,
        string audioIPFS
    );
    event RoyaltyPaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event MintingFeeUpdated(uint256 newFee);
    
    constructor() ERC721("BlockTek Music NFT", "BTKNFT") {}
    
    /**
     * @dev Mint a new music NFT
     */
    function mintMusicNFT(
        string memory title,
        string memory description,
        string memory audioIPFS,
        string memory imageIPFS,
        uint256 price,
        uint256 royaltyPercentage,
        string memory category
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(royaltyPercentage <= MAX_ROYALTY, "Royalty too high");
        require(!usedIPFSHashes[audioIPFS], "Audio already exists");
        require(bytes(title).length > 0, "Title required");
        require(bytes(audioIPFS).length > 0, "Audio IPFS required");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mark IPFS hash as used
        usedIPFSHashes[audioIPFS] = true;
        
        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            title: title,
            description: description,
            audioIPFS: audioIPFS,
            imageIPFS: imageIPFS,
            creator: msg.sender,
            price: price,
            royaltyPercentage: royaltyPercentage,
            category: category,
            createdAt: block.timestamp
        });
        
        // Set royalty info
        _royalties[tokenId] = RoyaltyInfo({
            recipient: msg.sender,
            percentage: royaltyPercentage
        });
        
        // Add to creator's NFT list
        creatorNFTs[msg.sender].push(tokenId);
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        // Set token URI (you can customize this)
        string memory tokenURI = string(abi.encodePacked(
            "https://ipfs.io/ipfs/", imageIPFS
        ));
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(tokenId, msg.sender, title, price, audioIPFS);
    }
    
    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "NFT does not exist");
        return nftMetadata[tokenId];
    }
    
    /**
     * @dev Get creator's NFTs
     */
    function getCreatorNFTs(address creator) external view returns (uint256[] memory) {
        return creatorNFTs[creator];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Update minting fee (only owner)
     */
    function updateMintingFee(uint256 newFee) external onlyOwner {
        mintingFee = newFee;
        emit MintingFeeUpdated(newFee);
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Royalty info for EIP-2981
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        returns (address, uint256) 
    {
        require(_exists(tokenId), "NFT does not exist");
        
        RoyaltyInfo memory royalty = _royalties[tokenId];
        uint256 royaltyAmount = (salePrice * royalty.percentage) / 10000;
        
        return (royalty.recipient, royaltyAmount);
    }
    
    /**
     * @dev Check if contract supports interface
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Pause contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override to add pause functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) 
        internal 
        override 
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!paused(), "Token transfers paused");
    }
}