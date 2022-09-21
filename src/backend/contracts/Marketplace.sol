// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";
contract Marketplace is ReentrancyGuard{

    address payable public immutable feeAccount;
    uint immutable public feePercent;
    uint public numOfItems;


    struct ListItem{
        uint itemId;
        uint tokenId;
        IERC721 nft;
        uint price;
        address payable seller;
        bool isListed;
    }
    mapping(uint=>ListItem) public items;

    // for interface
    event Listed(
        uint itemId,
        uint tokenId,
        address indexed nft,
        uint price,
        address indexed seller

    );
    // for ordered token
    event BoughtItem(
        uint itemId,
        uint tokenId,
        uint price,
        address indexed nft,
        address indexed buyer,
        address indexed seller
    );

    constructor(uint feePercent_) {
        feePercent=feePercent_;
        feeAccount=payable(msg.sender);
    }

    // called from create.js to build the token
    function buildItem(IERC721 nft_, uint tokenId_ ,uint price_) external nonReentrant {
        require(price_>0,"Price should be +ve");
        numOfItems++;

        // transfer from creater to smart contract
        nft_.transferFrom(msg.sender, address(this), tokenId_);

        // adding in map
        items[numOfItems]=ListItem(
            numOfItems,
            tokenId_,
            nft_,
            price_,
            payable(msg.sender),
            true            
        );
        emit Listed(numOfItems, tokenId_, address(nft_), price_, msg.sender);
    }
    

    function getTotPrice(uint itemId_)view public returns(uint){
        return ((items[itemId_].price*(100+feePercent))/100);
    }

    function buyItem(uint itemId_)external payable nonReentrant {
        // item id out of bound
        require(!(itemId_ <=0 || itemId_>numOfItems),"Item doesn't exists");
        
        // not enough balance in buyer's account
        uint totPrice=getTotPrice(itemId_);
        require(msg.value>=totPrice,"Not enough Balance!");
        
        ListItem storage item=items[itemId_];
        
        // item already sold => isListed=false
        require(item.isListed,"Item already Sold");

        // item price => seller
        item.seller.transfer(item.price);

        // fees => feeAccount
        feeAccount.transfer(totPrice-item.price);

        // Update isListed
        item.isListed=false;

        // transfer the token to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        items[itemId_]=item;
        
        emit BoughtItem(itemId_, item.tokenId, item.price, address(item.nft), msg.sender, item.seller);
        
    }
    
}