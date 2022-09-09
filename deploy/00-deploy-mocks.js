const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); //0.25 is the premium. It costs 0.25 LINK
const GAS_PRICE_LINK = 1e9; // Link per gas. calculated value based on the gas price of the network

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        });
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: ["8", "200000000000"]
        });
        log("Mocks deployed!");
        log("---------------------------------------------");
    }
};
module.exports.tags = ["all", "mocks"];
