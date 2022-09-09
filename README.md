# Mint my NFT

> This repo is based on [Patrick Collins amazing course](https://github.com/smartcontractkit/full-blockchain-solidity-course-js#lesson-14-hardhat-nfts-everything-you-need-to-know-about-nfts) and is all about NFTs

<br/>
<p align="center">
<img src="./images/randomNft/pug.png" width="225" alt="NFT Pug">
<img src="./images/dynamicNft/happy.svg" width="225" alt="NFT Happy">
<img src="./images/randomNft/shiba-inu.png" width="225" alt="NFT Shiba">
<img src="./images/dynamicNft/frown.svg" width="225" alt="NFT Frown">
<img src="./images/randomNft/st-bernard.png" width="225" alt="NFT St.Bernard">
</p>
<br/>

## What does it do?
It has all the code and deploys 3 types of NFTs (ERC721 tokens):
1. Basic NFT  
    It is the most simple example. All minted NFTs have the same metadata and picture(a cute dog you can own 🐶) hosted on IPFS.
2. Random NFT hosted on IPFS  
    At time of minting Chainlink VRF service is used to generate a truly random number. That number is used to pick from a Pug, Shiba Inu, St. Bernanrd for the image. They will be have a rarity associated:
    - Pug: super rare (feel lucky if you get this 😉)
    - Shiba: sort of rare
    - St. bernard: common  

    The users have to pay to mint an NFT. The owner of the contract can withdraw the ETH(simulating an artist getting payed for his job)  
    ✅ Pros: Cheaper  
    ❌ Cons: Using IPFS means someone needs to pin our data to make it decentrilized(otherwise we are back to square one)

3. Dynamic SVG NFT(100% on chain)  
    This is an NFT completly hosted on chain, where the image changes based on the prize of an asset(for that Chainlink Price Feed is used)

    ✅ Pros: The data is on chain  
    ❌ Cons: Storing data on chain is MUCH more expensive

## 🛠 Quick Start - Local network

> Clone the repo  
``` bash 
git clone https://github.com/ggonzalez94/hardhat-nft
```

> Install packages
``` bash 
yarn install
```

### Deploy

```
yarn hardhat deploy
```

### Testing

```
yarn hardhat test
```

### Test Coverage

```
yarn hardhat coverage
```


## 🚀 Deploying to a testnet or mainnet

1. Setup environment variables

You'll want to set your `RINKEBY_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file, similar to what you see in `.env.example`.

- `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
  - You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
- `RINKEBY_RPC_URL`: This is url of the rinkeby testnet node you're working with.

2. Get testnet ETH & LINK

Head over to [faucets.chain.link](https://faucets.chain.link/) and get some tesnet ETH & LINK. You should see the ETH and LINK show up in your metamask. [You can read more on setting up your wallet with LINK.](https://docs.chain.link/docs/deploy-your-first-contract/#install-and-fund-your-metamask-wallet)

3. Setup a Chainlink VRF Subscription ID

Head over to [vrf.chain.link](https://vrf.chain.link/) and setup a new subscription, and get a subscriptionId. You can reuse an old subscription if you already have one. 

[You can follow the instructions](https://docs.chain.link/docs/get-a-random-number/) if you get lost. You should leave this step with:

1. A subscription ID
2. Your subscription should be funded with LINK
3. Deploy

In your `helper-hardhat-config.ts` add your `subscriptionId` under the section of the chainId you're using (aka, if you're deploying to rinkeby, add your `subscriptionId` in the `subscriptionId` field under the `4` section.)

Then run:
```
yarn hardhat deploy --network rinkeby --tags main
```

We only deploy the `main` tags, since we need to add our `RandomIpfsNft` contract as a consumer. 

4. Add your contract address as a Chainlink VRF Consumer

Go back to [vrf.chain.link](https://vrf.chain.link) and under your subscription add `Add consumer` and add your contract address. You should also fund the contract with a minimum of 1 LINK.

5. Mint NFTs

Then run:

```
yarn hardhat deploy --network rinkeby --tags mint
```

**And that's it! Now you are the proud owner of 3 cute NFT Dogs 🐕**

## A side note on the random IPFS NFT

If you've followed the steps in this file you are using metadata and images that are already uploaded to IPFS. But if you want to deploy your own version of it(or more) the code is ready to upload data to [Pinata](https://www.pinata.cloud/) - an IPFS Gateway.  
You just need to configure the environment variables(PINATA_API_KEY, PINATA_API_SECRET) and set UPLOAD_TO_PINATA to true.  
The deploy file *02-deploy-randomipfs-nft* will do all the heavy work. The images to upload are at *images/randomNft*