'use client';

import { useGlobalData } from '@/hooks/useGlobalData';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function GlobalStats() {
    const { data, isLoading, error } = useGlobalData();
    const currency = useSelector((state: RootState) => state.ui.currency);

    if (isLoading) {
        return (
            <div className="flex items-center gap-6 text-xs text-gray-500 animate-pulse py-2 px-4 bg-gray-900/50 rounded-full border border-gray-800">
                <div className="h-4 w-24 bg-gray-800 rounded"></div>
                <div className="h-4 w-24 bg-gray-800 rounded"></div>
                <div className="h-4 w-24 bg-gray-800 rounded"></div>
            </div>
        );
    }

    if (error || !data) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code,
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    };

    const marketCap = data.total_market_cap[currency.code];
    const volume = data.total_volume[currency.code];
    const btcDominance = data.market_cap_percentage.btc;
    const ethDominance = data.market_cap_percentage.eth;
    const change24h = data.market_cap_change_percentage_24h_usd;

    return (
        <div className="hidden min-[1040px]:flex items-center gap-6 py-2 px-6 bg-gray-950/40 backdrop-blur-md rounded-full border border-indigo-500/20 text-[11px] font-medium tracking-wide">
            <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase">Market Cap:</span>
                <span className="text-indigo-400">{formatCurrency(marketCap)}</span>
                <span className={`text-[10px] ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h).toFixed(1)}%
                </span>
            </div>

            <div className="w-[1px] h-3 bg-gray-800" />

            <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase">24h Vol:</span>
                <span className="text-gray-200">{formatCurrency(volume)}</span>
            </div>

            <div className="w-[1px] h-3 bg-gray-800 hidden min-[1400px]:flex" />

            <div className="flex items-center gap-2 hidden min-[1400px]:flex">
                <span className="text-gray-500 uppercase">Dominance:</span>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-orange-400 font-bold">BTC</span>
                        <span className="text-gray-200">{btcDominance.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 font-bold">ETH</span>
                        <span className="text-gray-200">{ethDominance.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
