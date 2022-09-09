const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokeUriMetadata,
} = require("../utils/uploadToPinata");
require("process");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");
const imagesLocation = "./images/randomNft/";
let tokenUris = [
  //If UPLOAD_TO_PINATA not set to true this are used
  "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
  "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
  "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
];
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("Deploying RandomIpfsNFT....");
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address, subscriptionId, mock;

  //Upload to pinata ipfs the images and metadate for nfts
  if (process.env.UPLOAD_TO_PINATA == "true") {
    console.log("Uploading metadata to pinata....");
    tokenUris = await handleTokenUris();
  }

  // if we are on a local network get the address from the deployed mock
  if (developmentChains.includes(network.name)) {
    mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = mock.address;
    // In our local testnet we need to create the subscription and fund it programatically
    const transactionResponse = await mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    // Fund the subscription
    await mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const args = [
    vrfCoordinatorV2Address,
    networkConfig[chainId].gasLane,
    subscriptionId,
    networkConfig[chainId].callbackGasLimit,
    tokenUris,
    networkConfig[chainId].mintFee,
  ];

  const contract = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockCOnfirmations || 1,
  });

  if (developmentChains.includes(network.name)) {
    await mock.addConsumer(subscriptionId.toNumber(), contract.address);
  }

  // verify contract if not in a local network
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(contract.address, "RandomIpfsNft", args);
  }

  log("-------------------------------");
};

async function handleTokenUris() {
  tokenUris = [];
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };

    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;

    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokeUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs uploaded! They are:");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
