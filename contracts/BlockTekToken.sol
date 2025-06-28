// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BlockTekToken
 * @dev ERC20 token for BlockTek Radio platform rewards and governance
 */
contract BlockTekToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million tokens
    
    // Reward rates (tokens per hour)
    uint256 public listeningRewardRate = 10 * 10**18; // 10 tokens per hour
    uint256 public creatorRewardRate = 50 * 10**18; // 50 tokens per hour for creators
    
    // User tracking
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public listeningHours;
    mapping(address => bool) public isCreator;
    mapping(address => uint256) public creatorHours;
    
    // Events
    event RewardsClaimed(address indexed user, uint256 amount, string rewardType);
    event CreatorStatusUpdated(address indexed creator, bool status);
    event RewardRatesUpdated(uint256 listeningRate, uint256 creatorRate);
    
    constructor() ERC20("BlockTek Token", "BTK") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner, respects max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Set creator status for an address
     */
    function setCreatorStatus(address creator, bool status) external onlyOwner {
        isCreator[creator] = status;
        emit CreatorStatusUpdated(creator, status);
    }
    
    /**
     * @dev Update reward rates
     */
    function updateRewardRates(uint256 _listeningRate, uint256 _creatorRate) external onlyOwner {
        listeningRewardRate = _listeningRate;
        creatorRewardRate = _creatorRate;
        emit RewardRatesUpdated(_listeningRate, _creatorRate);
    }
    
    /**
     * @dev Record listening hours for a user
     */
    function recordListeningHours(address user, uint256 hours) external onlyOwner {
        listeningHours[user] += hours;
    }
    
    /**
     * @dev Record creator hours
     */
    function recordCreatorHours(address creator, uint256 hours) external onlyOwner {
        require(isCreator[creator], "Not a registered creator");
        creatorHours[creator] += hours;
    }
    
    /**
     * @dev Claim listening rewards
     */
    function claimListeningRewards() external whenNotPaused {
        require(listeningHours[msg.sender] > 0, "No listening hours recorded");
        require(block.timestamp >= lastClaimTime[msg.sender] + 1 hours, "Can only claim once per hour");
        
        uint256 reward = listeningHours[msg.sender] * listeningRewardRate;
        require(totalSupply() + reward <= MAX_SUPPLY, "Exceeds max supply");
        
        lastClaimTime[msg.sender] = block.timestamp;
        listeningHours[msg.sender] = 0; // Reset after claim
        
        _mint(msg.sender, reward);
        emit RewardsClaimed(msg.sender, reward, "listening");
    }
    
    /**
     * @dev Claim creator rewards
     */
    function claimCreatorRewards() external whenNotPaused {
        require(isCreator[msg.sender], "Not a registered creator");
        require(creatorHours[msg.sender] > 0, "No creator hours recorded");
        require(block.timestamp >= lastClaimTime[msg.sender] + 1 hours, "Can only claim once per hour");
        
        uint256 reward = creatorHours[msg.sender] * creatorRewardRate;
        require(totalSupply() + reward <= MAX_SUPPLY, "Exceeds max supply");
        
        lastClaimTime[msg.sender] = block.timestamp;
        creatorHours[msg.sender] = 0; // Reset after claim
        
        _mint(msg.sender, reward);
        emit RewardsClaimed(msg.sender, reward, "creator");
    }
    
    /**
     * @dev Get claimable listening rewards
     */
    function getClaimableListeningRewards(address user) external view returns (uint256) {
        return listeningHours[user] * listeningRewardRate;
    }
    
    /**
     * @dev Get claimable creator rewards
     */
    function getClaimableCreatorRewards(address creator) external view returns (uint256) {
        if (!isCreator[creator]) return 0;
        return creatorHours[creator] * creatorRewardRate;
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
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers paused");
    }
}