import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: ".env" });

const ALCHEMY_API_KEY_URL =
  "https://eth-sepolia.g.alchemy.com/v2/1sPKuLcdt7OVamPHgu-P2XngBcCJlcJp";

const SEPOLIA_PRIVATE_KEY =
  "89c991b791cf2583163aa15be5926917ff0b62256285ae0f3d930c255c34d844";

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      // Configuration for the local Hardhat network
      // You can specify chainId, accounts, mining parameters, etc.
      chainId: 31337,
      // Other options can be left as default for basic usage
    },
    sepolia: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
