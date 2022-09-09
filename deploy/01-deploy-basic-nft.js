const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deploying Basic NFT....");

  const args = [];

  const contract = await deploy("BasicNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1,
  });

  // verify contract if not in a local network
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(contract.address, "BasicNft", args);
  }

  log("-------------------------------");
};

module.exports.tags = ["all", "basicNft", "main"];
