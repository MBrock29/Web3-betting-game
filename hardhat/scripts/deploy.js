// @ts-ignore
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting Deployment...");
  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy();
  console.log("Contract Deployed, waiting for it to be mined...");

  console.log("Contract Mined!");

  console.log("Deployed Contract Address:", helloWorld.address);
  console.log("Deployment Transaction:", helloWorld.deployTransaction);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment Error:", error);
    process.exit(1);
  });
