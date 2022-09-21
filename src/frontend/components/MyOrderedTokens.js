import React from 'react'
import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import { ethers } from "ethers"

export default function MyOrderedTokens({ marketplace, nft, account }) {
    const [loading, setLoading] = useState(true)
    const [purchases, setPurchases] = useState([])
    const loadPurchasedItems = async () => {

        // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
        const filter = marketplace.filters.BoughtItem(null, null, null, null, account ,null)
        const results = await marketplace.queryFilter(filter)

        //Fetch metadata of each nft and add that to listedItem object.
        const purchases = await Promise.all(results.map(async index => {

            index = index.args

            // get uri url from nft contract
            const uri = await nft.tokenURI(index.tokenId)

            // use uri to fetch the nft metadata stored on ipfs 
            const response = await fetch(uri)
            const metadata = await response.json()

            // get total price of item (item price + fee)
            const totPrice = await marketplace.getTotPrice(index.itemId)

            // define listed item object
            let purchasedItem = {
                totPrice,
                price: index.price,
                itemId: index.itemId,
                name: metadata.name,
                description: metadata.description,
                image: metadata.image
            }
            return purchasedItem
        }))
        setLoading(false)
        setPurchases(purchases)
    }
    useEffect(() => {
        loadPurchasedItems()
    }, [])
    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading...</h2>
        </main>
    )
  return (
      <div className="flex justify-center">
          {purchases.length > 0 ?
              <div className="px-5 container">
                  <Row xs={1} md={2} lg={4} className="g-4 py-5">
                      {purchases.map((item, idx) => (
                          <Col key={idx} className="overflow-hidden">
                              <Card>
                                  <Card.Img variant="top" src={item.image} />
                                  <Card.Footer>{ethers.utils.formatEther(item.totPrice)} ETH</Card.Footer>
                              </Card>
                          </Col>
                      ))}
                  </Row>
              </div>
              : (
                  <main style={{ padding: "1rem 0" }}>
                      <h2>No purchases</h2>
                  </main>
              )}
      </div>
  )
}
