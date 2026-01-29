import { CoinMarketData } from "../types/yup";
import { formatCurrency, formatLargeNumber, formatPercentage } from "../utils/utils";
import Link from 'next/link';

export function AssetListItem({marketData, currency}: {marketData: CoinMarketData, currency: string}) {
const {
        id,
        market_cap_rank,
        name,
        symbol,
        image,
        current_price,
        price_change_percentage_1h_in_currency,
        price_change_percentage_24h_in_currency,
        price_change_percentage_7d_in_currency,
        total_volume,
        market_cap,
    } = marketData;

    return (
        <tr className="hover:bg-gray-800/30 transition-colors group">
            <td className="px-6 py-4 text-gray-500 font-mono text-sm bg-gray-800/30 text-center">{market_cap_rank}</td>
            <td className="bg-gray-800/50">
                <Link href={`/dashboard/${id}`} className="flex items-center gap-4 w-full px-4 py-6">
                    <img src={image} alt={name} className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col">
                        <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{name}</span>
                        <span className="text-gray-500 text-xs uppercase font-medium">{symbol}</span>
                    </div>
                </Link>
            </td>
            <td className="px-6 py-4 text-right font-medium text-gray-100">
                {formatCurrency(current_price, currency)}
            </td>
            <td className={`hidden min-[450px]:table-cell px-6 py-4 text-right font-medium ${
                (price_change_percentage_1h_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
                {formatPercentage(price_change_percentage_1h_in_currency)}
            </td>
            <td className={`hidden min-[600px]:table-cell px-6 py-4 text-right font-medium ${
                (price_change_percentage_24h_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
                {formatPercentage(price_change_percentage_24h_in_currency)}
            </td>
            <td className="hidden min-[700px]:table-cell px-6 py-4 text-right text-gray-300">
                {formatLargeNumber(total_volume)}
            </td>
            <td className="hidden min-[800px]:table-cell px-6 py-4 text-right text-gray-300">
                {formatLargeNumber(market_cap)}
            </td>
            <td className={`hidden min-[900px]:table-cell px-6 py-4 text-right pr-8 font-medium ${
                (price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
                {formatPercentage(price_change_percentage_7d_in_currency)}
            </td>
        </tr>
    )
}
