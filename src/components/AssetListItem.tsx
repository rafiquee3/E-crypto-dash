import { CoinMarketData } from "../types/yup";
import { formatCurrency, formatLargeNumber, formatPercentage } from "../utils/utils";
import Link from 'next/link';

export function AssetListItem({marketData, currency}: {marketData: CoinMarketData, currency: string}) {
const {
        id,
        market_cap_rank,
        name,
        symbol,
        current_price,
        price_change_percentage_1h_in_currency,
        price_change_percentage_24h_in_currency,
        price_change_percentage_7d_in_currency,
        total_volume,
        market_cap,
    } = marketData;

    return (
        <tr>
            <td>{market_cap_rank}</td>
            <td>
                <Link href={`/dashboard/${id}`}>
                    <div className="flex items-center">
                        <span>{name}-</span>
                        <span>{symbol}</span>
                    </div>
                </Link>
            </td>
            <td>{formatCurrency(current_price, currency)}</td>
            <td>{formatPercentage(price_change_percentage_1h_in_currency)}</td>
            <td>{formatPercentage(price_change_percentage_24h_in_currency)}</td>
            <td>{formatLargeNumber(total_volume)}</td>
            <td>{formatLargeNumber(market_cap)}</td>
            <td>{formatPercentage(price_change_percentage_7d_in_currency)}</td>
        </tr>
    )
}
