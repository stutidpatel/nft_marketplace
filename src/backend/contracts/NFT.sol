// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage{
    address payable owner;
    uint public curTokenId; //token count and token ID
    constructor() ERC721("AppAvengers NFT","AA NFT") {
    
    }
    // can only be called from outside the contract
    function mint(string memory _tokenURI) external returns (uint){
        curTokenId++;

        // _safeMint(to, tokenId) -> safely mint a new token
        _safeMint(msg.sender, curTokenId);

        // _setTokenURI(uint256 tokenId, string _tokenURI) -> called while creating token (create.js) 
        // set with pinata url
        _setTokenURI(curTokenId, _tokenURI);
        return curTokenId;
    }
}