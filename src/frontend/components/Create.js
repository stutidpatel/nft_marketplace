import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Button } from 'react-bootstrap'
import { uploadFileToIPFS, uploadJSONToIPFS } from './pinata'

const Create = ({ marketplace, nft }) => {
    const [fileURL, setFileURL] = useState(null)
    const [price, setPrice] = useState(null)
    const [description, setDescription] = useState('')
    const [name, setName] = useState('')

    const uploadToken = async (event) => {
        event.preventDefault()

        // fetch the file
        const file = event.target.files[0]

        // validation for legitimate file
        if (typeof file !== 'undefined') {

            try {
                console.log("file is defined")
                const response = await uploadFileToIPFS(file)
                if (response.success === true) {
                    console.log("file uploaded to pinata...", response.pinataURL)
                    setFileURL(response.pinataURL)

                }

            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        } else {
            console.log('file undefined')
        }

    }
    async function uploadToMetadataToIPFS() {

        //Make sure that none of the fields are empty
        if (!name || !description || !price || !fileURL) {
            
            return;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch (e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    // triggered when user clicks submit => set details

    // defualt function: sendind file to contract
    async function createNFT(e) {
        if (!fileURL || !price || !name || !description) {
            alert("Enter all details");
            return;
        }
        e.preventDefault();
        try {

            // upload metadata to ipfs to get token uri
            const metadataURL = await uploadToMetadataToIPFS();

            // adding it to contract
            console.log("Wait 5 min uploading...")


            // create the NFT

            // mint nft 
            await (await nft.mint(metadataURL)).wait()
            console.log("minted: ",nft.curTokenId());

            // get tokenId of new nft 
            const id = await nft.curTokenId()
            console.log("tokenId:  " , id);

            // approve marketplace to spend nft
            await (await nft.setApprovalForAll(marketplace.address, true)).wait()

            // add nft to marketplace
            const listingPrice = ethers.utils.parseEther(price.toString())
            console.log("listing price ", listingPrice);


            await (await marketplace.buildItem(nft.address, id, listingPrice)).wait()
            alert("Successfully listed your NFT!");

            // updating var
            setDescription('');
            setName('');
            setPrice('');
        } catch (e) {
            alert("Upload error" + e)
        }

    }

    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="content mx-auto">

                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToken}
                            />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                            <div className="d-grid px-0">
                                <Button onClick={createNFT} variant="primary" size="lg">
                                    Create & List NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default Create