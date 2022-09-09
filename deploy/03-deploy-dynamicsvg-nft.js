const { network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const fs = require("fs");

const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("Deploying Dynamic SVG NFT....");
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;

  // if we are on a local network get the address from the deployed mock
  if (developmentChains.includes(network.name)) {
    mock = await ethers.getContract("MockV3Aggregator");
    ethUsdPriceFeedAddress = mock.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });
  const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf8",
  });
  const args = [ethUsdPriceFeedAddress, lowSVG, highSVG];

  const contract = await deploy("DynamicSvgNft", {
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
    await verify(contract.address, "DynamicSvgNft", args);
  }

  log("-------------------------------");
};

module.exports.tags = ["all", "dynamicNft", "main"];
