export function AssetListItem({marketData}) {
    return (
        <li className="flex bg:grey-200">
            {marketData.name}
        </li>
    )
}

/* {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "image": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
    "current_price": 93406,
    "market_cap": 1864841183579,
    "market_cap_rank": 1,
    "fully_diluted_valuation": 1864844360033,
    "total_volume": 50284434446,
    "high_24h": 93468,
    "low_24h": 89426,
    "price_change_24h": 888.61,
    "price_change_percentage_24h": 0.96048,
    "market_cap_change_24h": 19578696996,
    "market_cap_change_percentage_24h": 1.06103,
    "circulating_supply": 19960809,
    "total_supply": 19960843,
    "max_supply": 21000000,
    "ath": 126080,
    "ath_change_percentage": -26.24901,
    "ath_date": "2025-10-06T18:57:42.558Z",
    "atl": 67.81,
    "atl_change_percentage": 137028.05575,
    "atl_date": "2013-07-06T00:00:00.000Z",
    "roi": null,
    "last_updated": "2025-12-11T21:35:44.218Z"
} */