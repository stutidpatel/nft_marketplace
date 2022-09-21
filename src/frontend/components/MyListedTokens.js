// sold tokens and all listed token
import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'
function renderSoldItems(items) {
    return (
        <>
            <h2>Sold</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
                {items.map((item, idx) => (
                    <Col key={idx} className="overflow-hidden">
                        <Card>
                            <Card.Img variant="top" src={item.image} />
                            <Card.Footer>
                                For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved {ethers.utils.formatEther(item.price)} ETH
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    )
}
function renderListedItems(items) {
    return (
        <>
            <h2>Listed</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
                {items.map((item, idx) => (
                    <Col key={idx} className="overflow-hidden">
                        <Card>
                            <Card.Img variant="top" src={item.image} />
                            <Card.Footer>
                                For {ethers.utils.formatEther(item.totalPrice)} ETH 
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    )
}
export default function MyListedTokens({ marketplace, nft, account }) {
    const [loading, setLoading] = useState(true)
    const [listedItems, setListedItems] = useState([])
    const [soldItems, setSoldItems] = useState([])
    const loadListedItems = async () => {
        // Load all sold items that the user listed
        const numOfItems = await marketplace.numOfItems()
        let listedItems = []
        let soldItems = []
        for (let index = 1; index <= numOfItems; index++) {
            const i = await marketplace.items(index)
            if (i.seller.toLowerCase() === account) {
                // get uri url from nft contract
                const uri = await nft.tokenURI(i.tokenId)

                // use uri to fetch the nft metadata stored on ipfs 
                const response = await fetch(uri)
                const metadata = await response.json()

                // get total price of item (item price + fee)
                const totalPrice = await marketplace.getTotPrice(i.itemId)
                
                // define listed item object
                let item = {
                    totalPrice,
                    price: i.price,
                    itemId: i.itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }

                // Add listed item to sold items array if sold
                if (!i.isListed) soldItems.push(item)
                else
                    listedItems.push(item)
            }
        }
        setLoading(false)
        setListedItems(listedItems)
        setSoldItems(soldItems)
    }
    useEffect(() => {
        loadListedItems()
    }, [])
    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading...</h2>
        </main>
    )
    return (
        <div className="flex justify-center">

            {
                listedItems.length > 0 || soldItems.length > 0 ?
                    <div className="px-5 py-3 container">

                        {/*<h2>Listed</h2>
                        <Row xs={1} md={2} lg={4} className="g-4 py-3">
                            {listedItems.map((item, idx) => (
                                <Col key={idx} className="overflow-hidden">
                                    <Card>
                                        <Card.Img variant="top" src={item.image} />
                                        <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                                    </Card>
                                </Col>
                            ))
                            }
                        // </Row>*/}
                        {listedItems.length > 0 ? renderListedItems(listedItems):<></>}
                        {soldItems.length > 0 ? renderSoldItems(soldItems):<></>}

                    </div>
                    : (
                        <main style={{ padding: "1rem 0" }}>
                            <h2>No listed assets</h2>
                        </main>
                    )
            }
        </div>
    )
}