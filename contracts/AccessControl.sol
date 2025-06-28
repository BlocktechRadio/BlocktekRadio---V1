// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BlockTekToken.sol";
import "./BlockTekNFT.sol";

/**
 * @title AccessControl
 * @dev Manages token-gated access to premium content
 */
contract AccessControl is Ownable {
    BlockTekToken public btkToken;
    BlockTekNFT public btkNFT;
    
    // Access requirements for different content tiers
    struct AccessRequirement {
        uint256 tokenAmount;     // Required BTK tokens
        uint256 nftCount;        // Required NFT count
        bool isActive;           // Whether this tier is active
        string tierName;         // Name of the tier
    }
    
    // Content access tiers
    mapping(uint256 => AccessRequirement) public accessTiers;
    mapping(address => mapping(uint256 => bool)) public userAccess;
    mapping(uint256 => uint256) public contentTier; // contentId => tierId
    
    uint256 public nextTierId = 1;
    uint256 public nextContentId = 1;
    
    // Events
    event AccessTierCreated(uint256 indexed tierId, string tierName, uint256 tokenAmount, uint256 nftCount);
    event ContentRegistered(uint256 indexed contentId, uint256 tierId, string title);
    event AccessGranted(address indexed user, uint256 indexed contentId);
    event AccessRevoked(address indexed user, uint256 indexed contentId);
    
    constructor(address _btkToken, address _btkNFT) {
        btkToken = BlockTekToken(_btkToken);
        btkNFT = BlockTekNFT(_btkNFT);
        
        // Create default tiers
        _createAccessTier("Free", 0, 0);
        _createAccessTier("Premium", 100 * 10**18, 0); // 100 BTK tokens
        _createAccessTier("VIP", 500 * 10**18, 1);     // 500 BTK + 1 NFT
        _createAccessTier("Elite", 1000 * 10**18, 3);  // 1000 BTK + 3 NFTs
    }
    
    /**
     * @dev Create a new access tier
     */
    function createAccessTier(
        string memory tierName,
        uint256 tokenAmount,
        uint256 nftCount
    ) external onlyOwner returns (uint256) {
        return _createAccessTier(tierName, tokenAmount, nftCount);
    }
    
    /**
     * @dev Internal function to create access tier
     */
    function _createAccessTier(
        string memory tierName,
        uint256 tokenAmount,
        uint256 nftCount
    ) internal returns (uint256) {
        uint256 tierId = nextTierId++;
        
        accessTiers[tierId] = AccessRequirement({
            tokenAmount: tokenAmount,
            nftCount: nftCount,
            isActive: true,
            tierName: tierName
        });
        
        emit AccessTierCreated(tierId, tierName, tokenAmount, nftCount);
        return tierId;
    }
    
    /**
     * @dev Register content with access tier
     */
    function registerContent(uint256 tierId, string memory title) external onlyOwner returns (uint256) {
        require(accessTiers[tierId].isActive, "Invalid access tier");
        
        uint256 contentId = nextContentId++;
        contentTier[contentId] = tierId;
        
        emit ContentRegistered(contentId, tierId, title);
        return contentId;
    }
    
    /**
     * @dev Check if user has access to content
     */
    function hasAccess(address user, uint256 contentId) external view returns (bool) {
        uint256 tierId = contentTier[contentId];
        require(accessTiers[tierId].isActive, "Invalid content");
        
        AccessRequirement memory requirement = accessTiers[tierId];
        
        // Check token balance
        if (requirement.tokenAmount > 0) {
            if (btkToken.balanceOf(user) < requirement.tokenAmount) {
                return false;
            }
        }
        
        // Check NFT count
        if (requirement.nftCount > 0) {
            uint256[] memory userNFTs = btkNFT.getCreatorNFTs(user);
            if (userNFTs.length < requirement.nftCount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Grant manual access to user (admin function)
     */
    function grantAccess(address user, uint256 contentId) external onlyOwner {
        userAccess[user][contentId] = true;
        emit AccessGranted(user, contentId);
    }
    
    /**
     * @dev Revoke manual access from user (admin function)
     */
    function revokeAccess(address user, uint256 contentId) external onlyOwner {
        userAccess[user][contentId] = false;
        emit AccessRevoked(user, contentId);
    }
    
    /**
     * @dev Update access tier requirements
     */
    function updateAccessTier(
        uint256 tierId,
        uint256 tokenAmount,
        uint256 nftCount,
        bool isActive
    ) external onlyOwner {
        require(tierId < nextTierId, "Invalid tier ID");
        
        AccessRequirement storage tier = accessTiers[tierId];
        tier.tokenAmount = tokenAmount;
        tier.nftCount = nftCount;
        tier.isActive = isActive;
    }
    
    /**
     * @dev Get access tier info
     */
    function getAccessTier(uint256 tierId) external view returns (AccessRequirement memory) {
        require(tierId < nextTierId, "Invalid tier ID");
        return accessTiers[tierId];
    }
    
    /**
     * @dev Get user's qualification for a tier
     */
    function getUserTierQualification(address user, uint256 tierId) 
        external 
        view 
        returns (bool qualifies, uint256 userTokens, uint256 userNFTs) 
    {
        require(tierId < nextTierId, "Invalid tier ID");
        
        AccessRequirement memory requirement = accessTiers[tierId];
        userTokens = btkToken.balanceOf(user);
        userNFTs = btkNFT.getCreatorNFTs(user).length;
        
        qualifies = (userTokens >= requirement.tokenAmount) && 
                   (userNFTs >= requirement.nftCount);
    }
    
    /**
     * @dev Get all active tiers
     */
    function getActiveTiers() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active tiers
        for (uint256 i = 1; i < nextTierId; i++) {
            if (accessTiers[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active tier IDs
        uint256[] memory activeTiers = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextTierId; i++) {
            if (accessTiers[i].isActive) {
                activeTiers[index] = i;
                index++;
            }
        }
        
        return activeTiers;
    }
}