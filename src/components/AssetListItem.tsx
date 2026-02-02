import { CoinMarketData } from "../types/yup";
import { formatCurrency, formatLargeNumber, formatPercentage } from "../utils/utils";
import Link from 'next/link';
import { memo } from 'react';

function AssetListItemComponent({marketData, currency}: {marketData: CoinMarketData, currency: string}) {
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
        <Link
            href={`/coin/${id}`}
            aria-label={`View details for ${name}`}
            className="flex items-center odd:bg-gray-800/40 even:bg-gray-800/30 hover:bg-blue-800/30 transition-all duration-200 group px-6 py-6"
            style={{
                // Browser-level virtualization: don't paint rows that are off-screen
                contentVisibility: 'auto',
                // Tell the browser to expect a ~81px height to prevent scrollbar jumping
                containIntrinsicSize: 'auto 81px',
            } as React.CSSProperties}
        >
            <div className="w-12 text-center text-gray-500 font-mono text-sm group-hover:text-gray-400 transition-colors">
                {market_cap_rank}
            </div>

            <div className="flex-1 flex items-center gap-4 min-w-0 px-4">
                <img src={image} alt="" className="hidden min-[400px]:block w-8 h-8 rounded-full flex-shrink-0 shadow-lg shadow-black/50" />
                <div className="flex flex-col min-w-0">
                    <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors truncate">
                        {name}
                    </span>
                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                        {symbol}
                    </span>
                </div>
            </div>

            <div className="w-32 text-right font-mono text-sm font-medium text-gray-100 group-hover:text-white">
                {formatCurrency(current_price, currency)}
            </div>

            <div
                className={`hidden min-[520px]:block w-24 text-right font-medium text-xs ${(price_change_percentage_1h_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                aria-label={`1 hour change: ${formatPercentage(price_change_percentage_1h_in_currency)} ${(price_change_percentage_1h_in_currency ?? 0) >= 0 ? 'gain' : 'loss'}`}
            >
                {formatPercentage(price_change_percentage_1h_in_currency)}
            </div>

            <div
                className={`hidden min-[600px]:block w-24 text-right font-medium text-xs ${(price_change_percentage_24h_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                aria-label={`24 hour change: ${formatPercentage(price_change_percentage_24h_in_currency)} ${(price_change_percentage_24h_in_currency ?? 0) >= 0 ? 'gain' : 'loss'}`}
            >
                {formatPercentage(price_change_percentage_24h_in_currency)}
            </div>

            <div className="hidden min-[700px]:block w-24 text-right text-gray-400 text-xs font-medium">
                {formatLargeNumber(total_volume)}
            </div>

            <div className="hidden min-[800px]:block w-24 text-right text-gray-400 text-xs font-medium">
                {formatLargeNumber(market_cap)}
            </div>

            <div
                className={`hidden min-[990px]:block w-24 text-right pr-2 font-medium text-xs ${(price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                aria-label={`7 day change: ${formatPercentage(price_change_percentage_7d_in_currency)} ${(price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'gain' : 'loss'}`}
            >
                {formatPercentage(price_change_percentage_7d_in_currency)}
            </div>
        </Link>
    )
}

export const AssetListItem = memo(AssetListItemComponent);
