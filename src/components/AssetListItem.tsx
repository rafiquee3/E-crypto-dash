import { CoinMarketData } from "../types/data";
import { formatCurrency, formatLargeNumber, formatPercentage } from "../utils/utils";

export function AssetListItem({marketData, currency}: {marketData: CoinMarketData, currency: string}) {
const {
        market_cap_rank,
        name,
        symbol,
        current_price,
        price_change_percentage_1h_in_currency,
        price_change_percentage_24h,
        price_change_percentage_7d_in_currency,
        total_volume,
        market_cap,
    } = marketData;

    return (
        <tr>         
            <td>{market_cap_rank}</td>
            <td>
                <div className="flex items-center">
                    <span>{name}</span>
                    <span>{symbol}</span>
                </div>
            </td>
            <td>{formatCurrency(current_price, currency)}</td>
            <td>{formatPercentage(price_change_percentage_1h_in_currency)}</td>
            <td>{formatPercentage(price_change_percentage_24h)}</td>
            <td>{formatLargeNumber(total_volume)}</td>
            <td>{formatLargeNumber(market_cap)}</td>
            <td>{formatPercentage(price_change_percentage_7d_in_currency)}</td>
        </tr>
    )
}
