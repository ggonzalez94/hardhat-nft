const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

// const {
//   developmentChains,
//   networkConfig,
// } = require("../../helper-hardhat-config");

describe("Basic NFT Unit Tests", function () {
  let basicNft, deployer;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["basicNft"]);
    basicNft = await ethers.getContract("BasicNft", deployer);
  });

  describe("Constructor", function () {
    it("deploys the contract", async () => {
      assert(basicNft.address, "The contract is not deployed");
    });

    it("initializes the counter to 0", async () => {
      const counter = (await basicNft.getTokenCounter()).toString();
      assert.equal(counter, "0", "The counter has not been initialized to 0");
    });
  });

  describe("Mint NFT", function () {
    it("increases the counter when minting", async () => {
      const initialCounter = await basicNft.getTokenCounter();
      const tx = await basicNft.mintNft();
      await tx.wait(1);

      const finalCounter = await basicNft.getTokenCounter();
      expect(finalCounter).to.equal(initialCounter.add(1));
    });

    it("increases the minted nfts for the sender", async () => {
      const initialBalance = await basicNft.balanceOf(deployer);
      const tx = await basicNft.mintNft();
      await tx.wait(1);

      const finalBalance = await basicNft.balanceOf(deployer);
      expect(finalBalance).to.equal(initialBalance.add(1));
    });

    it("sets the uri correctly after minting", async () => {
      const TOKEN_URI = await basicNft.TOKEN_URI();

      const tx = await basicNft.mintNft();
      await tx.wait(1);
      const nftUri = await basicNft.tokenURI(0);

      assert.equal(
        nftUri,
        TOKEN_URI,
        "The nft uri is not been set properly after minting"
      );
    });
  });
});
