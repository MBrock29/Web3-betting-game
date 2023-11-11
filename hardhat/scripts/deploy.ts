const { ethers } = require("hardhat");

async function main() {
  const bettingGameContract = await ethers.getContractFactory("BettingGame");

  const deployedBettingGameContract = await bettingGameContract.deploy();

  console.log(
    "Betting Game Contract Address:",
    deployedBettingGameContract.address
  );
  console.log(
    "Deployment transaction:",
    deployedBettingGameContract.deployTransaction
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
