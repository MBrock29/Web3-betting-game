const { ethers } = require("hardhat");

async function main() {
  const GameContract = await ethers.getContractFactory("Game");

  const deployedGameContract = await GameContract.deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
