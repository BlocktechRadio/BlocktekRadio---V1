const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying BlockTek Radio contracts...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());
  
  // Deploy BlockTekToken
  console.log('\n1. Deploying BlockTekToken...');
  const BlockTekToken = await ethers.getContractFactory('BlockTekToken');
  const btkToken = await BlockTekToken.deploy();
  await btkToken.deployed();
  console.log('BlockTekToken deployed to:', btkToken.address);
  
  // Deploy BlockTekNFT
  console.log('\n2. Deploying BlockTekNFT...');
  const BlockTekNFT = await ethers.getContractFactory('BlockTekNFT');
  const btkNFT = await BlockTekNFT.deploy();
  await btkNFT.deployed();
  console.log('BlockTekNFT deployed to:', btkNFT.address);
  
  // Deploy AccessControl
  console.log('\n3. Deploying AccessControl...');
  const AccessControl = await ethers.getContractFactory('AccessControl');
  const accessControl = await AccessControl.deploy(btkToken.address, btkNFT.address);
  await accessControl.deployed();
  console.log('AccessControl deployed to:', accessControl.address);
  
  // Set up initial configuration
  console.log('\n4. Setting up initial configuration...');
  
  // Grant AccessControl permission to manage tokens
  await btkToken.setCreatorStatus(accessControl.address, true);
  console.log('AccessControl granted creator status on token contract');
  
  // Create some sample content tiers
  const contentTx1 = await accessControl.registerContent(1, 'Free Daily News');
  await contentTx1.wait();
  console.log('Registered free content');
  
  const contentTx2 = await accessControl.registerContent(2, 'Premium Analysis');
  await contentTx2.wait();
  console.log('Registered premium content');
  
  const contentTx3 = await accessControl.registerContent(3, 'VIP Exclusive Interviews');
  await contentTx3.wait();
  console.log('Registered VIP content');
  
  // Summary
  console.log('\n=== Deployment Summary ===');
  console.log('BlockTekToken:', btkToken.address);
  console.log('BlockTekNFT:', btkNFT.address);
  console.log('AccessControl:', accessControl.address);
  console.log('Deployer:', deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    contracts: {
      BlockTekToken: btkToken.address,
      BlockTekNFT: btkNFT.address,
      AccessControl: accessControl.address
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log('\nDeployment completed successfully!');
  console.log('Save this information for frontend integration:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });