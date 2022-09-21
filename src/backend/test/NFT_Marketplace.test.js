const { Description } = require("@ethersproject/properties");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFT and Marketplace tests", function () {
    let nft, marketplace, feePercent = 2;
    let deployer, addr1, addr2,addr3;
    let URI = "Dummy";
    beforeEach(async function () {
    
        [deployer, addr1, addr2,addr3] = await ethers.getSigners();
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");
        
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);
    
    });
    describe("Deployment", function () {
        it("Should track nft collects details", async function () {
            expect(await nft.name()).to.equal("AppAvengers NFT");
            expect(await nft.symbol()).to.equal("AA NFT");
        })
        it("Should track feePercent and acc", async function () {
            expect(await marketplace.feePercent()).to.equal(feePercent);
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            
        })
    })
    describe("NFT Minting", function () {
        it("Should track minted nft", async function () {
            await nft.connect(addr1).mint(URI);
            expect(await nft.curTokenId()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
        })
    })
    describe("Marketplace items", function () {
        beforeEach(async function () {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
        })
        it("Should track created items", async function () {
            await expect(marketplace.connect(addr1).
                buildItem(nft.address, 1, toWei(1))).to.emit(marketplace, "Listed")
                .withArgs(
                1, 1, nft.address, toWei(1),addr1.address
            )
            //  owner now is marketplace
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            // num of items in marketplace
            expect(await marketplace.numOfItems()).to.equal(1)
            // item from mapping
            const item = await marketplace.items(1)
            expect(await item.itemId).to.equal(1);
            expect(await item.nft).to.equal(nft.address);
            expect(await item.price).to.equal(toWei(1));
            expect(await item.isListed).to.equal(true);
            expect(await item.tokenId).to.equal(1);
        })
    })

    describe("Purchase Items", function () {
        let price = 4;
        let fee = (feePercent / 100) * price; // feePercentage of Price
        let totPriceInWei;
        beforeEach(async function () {
            await nft.connect(addr1).mint(URI);
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
            await marketplace.connect(addr1).buildItem(nft.address, 1, toWei(price));

            
        })
        // update isListed, update buyer, transfers eths
        it("update buy and ListItem fields",async function () {
            const curSeller = await addr1.getBalance();
            const curFeeAccount = await deployer.getBalance();

            totPriceInWei = await marketplace.getTotPrice(1);
            await expect(marketplace.connect(addr2).buyItem(1, { value: totPriceInWei })).to.emit(
                marketplace, "BoughtItem").withArgs(1, 1, toWei(price),nft.address, addr2.address, addr1.address)
            
            
            // updated balance
            const finalSeller = await addr1.getBalance();
            const finalFeeAccount = await deployer.getBalance();

            // isListed should be false
            expect((await marketplace.items(1)).isListed).to.equal(false)

            //  owner should be updated
            expect(await nft.ownerOf(1)).to.equal(addr2.address)

            // seller = curSeller + price (getBalance returns in wei)
            expect(+finalSeller).to.equal(+toWei(price) + +curSeller); //comparison in wei
            // expect(+fromWei(finalSeller)).to.equal(+price + +fromWei(curSeller)) // comp in ethers

            // finalfeeAcc = curFee + fee
            expect(+finalFeeAccount).to.equal(+toWei(fee) + +curFeeAccount);
            // expect(+fromWei(finalFeeAccount)).to.equal(+fee + +fromWei(curFeeAccount))

            
        })

        it("Invalid scenario", async function () {
            // item id out of bound
            await expect(marketplace.connect(addr2).buyItem(0, { value: totPriceInWei })).to.be.revertedWith("Item doesn't exists");
            await expect(marketplace.connect(addr2).buyItem(4, { value: totPriceInWei })).to.be.revertedWith("Item doesn't exists");

            // insuffienct funds
            await expect(marketplace.connect(addr2).buyItem(1, { value: 0 })).to.be.revertedWith("Not enough Balance!");
            await expect(marketplace.connect(addr2).buyItem(1, { value: toWei(price) })).to.be.revertedWith("Not enough Balance!");

            // item already sold
            await marketplace.connect(addr2).buyItem(1, { value: totPriceInWei })
            await expect(marketplace.connect(addr3).buyItem(1, { value: totPriceInWei })).to.be.revertedWith("Item already Sold");


            
            
        })
    })
})