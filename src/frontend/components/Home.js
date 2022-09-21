import React, { useState,useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { ethers } from "ethers"

const Home = ({ marketplace, nft }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const listItems = async () => {
        let items = []
        const numOfItems = await marketplace.numOfItems();

        for (let index = 1; index <= numOfItems; index++) {
            const item = await marketplace.items(index)
            if (item.isListed) {

                // get uri url from nft contract
                const uri = await nft.tokenURI(item.tokenId)
                console.log("uri: ", uri)

                
                // use uri to fetch the nft metadata stored on ipfs 
                const response = await fetch(uri)
                console.log("response:", response)
                
                const metadata = await response.json()
                // const metadata = await fetch(response.url)

                // get total price of item (item price + fee)
                const totalPrice = await marketplace.getTotPrice(item.itemId)

                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
      
        setLoading(false);
        setItems(items);

    }
    const buyMarketItem = async (item) => {
        await (await marketplace.buyItem(item.itemId, { value: item.totalPrice })).wait()
        listItems()
    }

    useEffect(() => {
        listItems()
    }, [])
    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading....</h2>
        </main>
    )
    return (
        <div className="flex justify-center">
            {
                (items.length > 0) ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {items.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body color="secondary">
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>
                                            {item.description}
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                            <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                                Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                            </Button>
                                        </div>
                        </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2>No listed assets</h2>
                    </main>
                )}
        </div>
    )
}
export default Home
