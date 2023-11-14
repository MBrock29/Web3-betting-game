import { ContractRunner } from "ethers";
const { ethers } = require("hardhat");

async function main() {
  const GameContract = await ethers.getContractFactory("Game");

  const deployedGameContract = await GameContract.deploy();

  console.log("Contract address", deployedGameContract);
  console.log("Contract deployed to:", deployedGameContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
