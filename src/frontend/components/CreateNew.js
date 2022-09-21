import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Button } from 'react-bootstrap'
// import { create } from 'ipfs-http-client'
// import * as IPFS from 'ipfs-http-client-lite'
const IPFS = require('ipfs-api')
// import getWeb3 from './utils/getWeb3'
const client = IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// const client = create('https://ipfs.infura.io:5001/api/v0')

// import * as IPFS from 'ipfs-http-client-lite'
// const client = create({
//     host: 'ipfs.infura.io', port: 5001, protocol: 'https', apiPath: '/api/v0', headers: {
//         // authorization: auth
//     }
// });
/*
tried
const ipfs = require('ipfs-http-client');
const client =  IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', apiPath: '/api/v0' });
const client =  await IPFS.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', apiPath: '/api/v0' });
const client = window.IpfsApi('localhost', 5001)
*/
const Create = ({ marketplace, nft }) => {
    const [image, setImage] = useState('')
    const [buffer, setBuffer] = useState({})
    const [price, setPrice] = useState(null)
    const [description, setDescription] = useState('')
    const [name, setName] = useState('')

    const uploadToken = async (event) => {
        console.log("in upload Token create.js", event)
        event.preventDefault()

        // fetch the file
        const file = event.target.files[0]
        console.log(file)

        // validation for legitimate file
        if (typeof file !== 'undefined') {
            // file["preview"] = URL.createObjectURL(file);
            // const reader = new window.FileReader();
            // reader.readAsArrayBuffer(file);
            // reader.onload = async function () {
            //     this.setBuffer(Buffer(reader.result));
            //     console.log(
            //         {buffer}
            //     );
            //     // setBuffer({ buf });
            // }
            try {
                console.log("file is defined", client)
                // client.add(this.state.buffer, (error, result) => {
                //     console.log("IPFS result: ", result)
                //     if (error) {
                //         console.log("error: ", error)
                //         return
                //     }
                // })
                // const data = Buffer.from(file)
                // console.log(typeof(data))


                // const data = Buffer.from('hello world!')
                // console.log("fff",typeof(data))

                // const result = await client.files.add(buf)
                // console.log(result)

                // const result = await client.add(data)
                // const result = await client.add(file)
                // const result = await client.add(this.state.buffer)
                // console.log(result)
                client.files.add(this.state.buffer, (error, result) => {
                    if (error) {
                        console.error(error)
                        return
                    }
                    // this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
                    //     return this.setState({ ipfsHash: result[0].hash })
                    //     console.log('ifpsHash', this.state.ipfsHash)
                    // })
                })
                // setImage(`http://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        }

    }

    // triggered when user clicks submit => set details
    const createNFT = async () => {
        console.log("FIll all field")
        if (!image || !price || !name || !description) return
        // if ( !price || !name || !description) return
        console.log("in create nft in create.js")
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }))
            mintThenList(result)
        } catch (error) {
            console.log("ipfs uri upload error: ", error)
        }
    }
    const mintThenList = async (result) => {
        console.log("in mintthelist in create.js")

        // const uri = `https://ipfs.infura.io/ipfs/${result.path}`
        const uri = toString(1 + Math.random() * (100));
        // console.log(uri);
        // mint nft 
        await (await nft.mint(uri)).wait()
        // get tokenId of new nft 
        const id = await nft.curTokenId()
        // approve marketplace to spend nft
        await (await nft.setApprovalForAll(marketplace.address, true)).wait()
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace.buildItem(nft.address, id, listingPrice)).wait()

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