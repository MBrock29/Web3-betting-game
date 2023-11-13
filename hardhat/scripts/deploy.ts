const { ethers } = require("hardhat");

async function main() {
  const GameContract = await ethers.getContractFactory("Game");

  const deployedGameContract = await GameContract.deploy();

  console.log("Contract address", deployedGameContract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
