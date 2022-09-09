3 contracts

1. Basic NFT ✅
    All minted NFTs have the same metadata and picture
2. Random at creation IPFS NFT ✅
    At time of minting we will trigger a Chainlink VRF to get a random numer. We will use that number to pick from a Pug, Shiba Inu, St. Bernanrd for the image. They will be have a rarity associated:
    - Pug: super rare
    - Shiba: sort of rare
    - St. bernard: common
    > Users have to pay to mint an NFT. The owner of the contract can withdraw the ETH(artist gets payed)

    Pros: Cheaper
    Cons: Using IPFS someone needs to pin our data to make it decentrilized
3. Dynamic SVG NFT(100% on chain)
    Its an NFT completly hosted on chain, where the image changes based on the prize of an asset.

    Pros: The data is on chain
    Cons: MUCH more expensive

    We are going to use SVGs since they are lighter.
    If price of ETH(taken from chainlink data aggregators) is above X -> Happy face SVG
    If price is below -> sad face SVG

``` ps
    # if you want to run only randomipfs nft locally
    yarn hardhat deploy --tags "randomipfs,mocks"
```