'use client';
import { useState } from "react";
import { useCryptoMarkets } from "../hooks/useCryptoMarkets";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { RootState } from "../store/store";
import { AssetListItem } from "./AssetListItem";
import { setCurrency } from "../store/uiSlice";

export function AssetList() {
    const currency = useAppSelector((state: RootState) => state.ui.currency);

    const {
        data,
        isLoading,
        isError,
        error,          // object
        isFetching,
        refetch,        // refresh data
        status,
        isSuccess,
    } = useCryptoMarkets({
        vs_currency: currency.code,
        per_page: '10',
        page: '1'
    });

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return (
            <div>
                <p>Error loading assets</p>
                <button onClick={() => refetch()}>Retry</button>
            </div>
        );
    }

    if (!Array.isArray(data) || !data.length) {
        return <div>No data</div>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950/50 mb-20 mt-30">
            <table className="w-full text-left border-collapse min-w-[350px]">
                <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider font-semibold bg-gray-800/30">
                        <th className="px-6 py-4 font-medium">#</th>
                        <th className="px-6 py-4 font-medium">Coin</th>
                        <th className="px-6 py-4 font-medium text-right">Price</th>
                        <th className="hidden min-[450px]:table-cell px-6 py-4 font-medium text-right">1h</th>
                        <th className="hidden min-[600px]:table-cell px-6 py-4 font-medium text-right">24h</th>
                        <th className="hidden min-[700px]:table-cell px-6 py-4 font-medium text-right">Volume</th>
                        <th className="hidden min-[800px]:table-cell px-6 py-4 font-medium text-right truncate">Market Cap</th>
                        <th className="hidden min-[900px]:table-cell px-6 py-4 font-medium text-right pr-8 truncate">Last 7 Days</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {data.map(data => <AssetListItem key={data.id} marketData={data} currency={currency.code}/>)}
                </tbody>
            </table>
        </div>
    )
}
