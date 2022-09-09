const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const mintFee = ethers.utils.parseEther("0.1");

// const {
//   developmentChains,
//   networkConfig,
// } = require("../../helper-hardhat-config");

describe("Random IPFS NFT Unit Tests", function () {
  let randomIpfsNft, deployer, vrfCoordinatorV2Mock;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["randomipfs", "mocks"]);
    randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
  });

  describe("Request NFT", function () {
    it("reverts when not enough it is sent", async () => {
      await expect(
        randomIpfsNft.requestNft({ value: ethers.utils.parseEther("0.001") })
      ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
    });

    it("emits nft requested event", async () => {
      await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
        randomIpfsNft,
        "NftRequested"
      );
    });

    it("requests a random number and deployer is added to the mapping", async () => {
      const transactionResponse = await randomIpfsNft.requestNft({
        value: mintFee,
      });
      const transactionReceipt = await transactionResponse.wait(1);
      const requestId = transactionReceipt.events[1].args.requestId;
      const nftOwner = await randomIpfsNft.s_requestIdToSender(requestId);
      assert.exists(requestId);
      assert.equal(nftOwner, deployer);
    });
  });

  describe("Withdraw", function () {
    it("fails when not owner", async () => {
      const [, notOwner] = await ethers.getSigners();
      const contract = randomIpfsNft.connect(notOwner);
      const tx = await contract.requestNft({
        value: mintFee,
      });
      await tx.wait(1);
      await expect(contract.withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("owner can withdraw and balance increases", async () => {
      const [deployer, notOwner] = await ethers.getSigners();
      const initialBalance = await deployer.getBalance();

      let contract = randomIpfsNft.connect(notOwner);
      const tx = await contract.requestNft({
        value: mintFee,
      });
      await tx.wait(1);

      contract = randomIpfsNft.connect(deployer);
      await contract.withdraw();
      const finalBalance = await deployer.getBalance();

      expect(finalBalance).to.above(initialBalance);
    });
  });

  describe("fulfillRandomWords", () => {
    it("mints NFT after random number is returned", async function () {
      await new Promise(async (resolve, reject) => {
        randomIpfsNft.once("NftMinted", async () => {
          try {
            const tokenUri = await randomIpfsNft.tokenURI("0");
            const tokenCounter = await randomIpfsNft.getTokenCounter();
            assert.equal(tokenUri.toString().includes("ipfs://"), true);
            assert.equal(tokenCounter.toString(), "1");
            resolve();
          } catch (e) {
            console.log(e);
            reject(e);
          }
        });
        try {
          const fee = await randomIpfsNft.getMintFee();
          const requestNftResponse = await randomIpfsNft.requestNft({
            value: fee.toString(),
          });
          const requestNftReceipt = await requestNftResponse.wait(1);
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestNftReceipt.events[1].args.requestId,
            randomIpfsNft.address
          );
        } catch (e) {
          console.log(e);
          reject(e);
        }
      });
    });
  });
});
