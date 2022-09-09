// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error RandomIpfsNft__WithdrawFailed();
error RandomIpfsNft__NeedMoreETHSent();

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3; // default
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public s_requestIdToSender; //keeps track of who requested the nft so we can have the address when minting

    //NFT variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[3] internal s_dogTokenUris;
    uint256 internal immutable i_mintFee;

    //Events
    event NftRequested(uint256 indexed requestId, address indexed requester);
    event NftMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) ERC721("Random IPFS NFT", "RIN") VRFConsumerBaseV2(vrfCoordinatorV2) {
        s_tokenCounter = 0;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        i_subscriptionId = subscriptionId;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256){
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreETHSent();
        }

        // Request the random number
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, //gasLane - maximum gas price you are willing to pay for a request in wei. Its a hash for predefined values
            i_subscriptionId,
            REQUEST_CONFIRMATIONS, //How many confirmations the Chainlink node should wait before responding. The longer the node waits, the more secure the random value is
            i_callbackGasLimit, //The limit for how much gas to use for the callback request to your contract's fulfillRandomWords() function
            NUM_WORDS //How many random values to request. If you can use several random values in a single callback, you can reduce the amount of gas that you spend per random value
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address tokenOwner = s_requestIdToSender[requestId];

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE; //This returns a number 0-99.We can use that number to get a value from our chanceArray
        Breed dogBreed = getBreedFromModdedRng(moddedRng);

        _safeMint(tokenOwner, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_dogTokenUris[uint256(dogBreed)]);
        s_tokenCounter = s_tokenCounter + 1;

        emit NftMinted(dogBreed, tokenOwner);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        if (!success) {
            revert RandomIpfsNft__WithdrawFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        // 0 - 9 -> PUG
        // 10 - 29 -> SHIBA
        // 30 - 100 -> St. Bernard
        
        if (moddedRng < getChanceArray()[0]) {
            return Breed.PUG;
        }
        if (moddedRng < getChanceArray()[1]) {
            return Breed.SHIBA_INU;
        }
        return Breed.ST_BERNARD; 
    }

    function getChanceArray() public pure returns(uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE]; //array to distribute chances of each bread of dog. PUG:10%, SHIBA: 20%, ST BERNARD: 60%
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUri(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
