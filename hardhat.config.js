require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const HASHKEY_PRIVATE_KEY = process.env.HASHKEY_PRIVATE_KEY;

const accounts = HASHKEY_PRIVATE_KEY ? [HASHKEY_PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hashkeyTestnet: {
      url: "https://testnet.hsk.xyz/",
      chainId: 133,
      accounts,
    },
    hashkeyMainnet: {
      url: "https://mainnet.hsk.xyz/",
      chainId: 177,
      accounts,
    },
  },
};
