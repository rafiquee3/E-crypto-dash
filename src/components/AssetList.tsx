'use client';
import { useState } from "react";
import { useCryptoMarkets } from "../hooks/useCryptoMarkets";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { RootState } from "../store/store";
import { AssetListItem } from "./AssetListItem";
import { setCurrency } from "../store/uiSlice";

export function AssetList() {
    const currency = useAppSelector((state: RootState) => state.ui.currency);
    const [shouldThrow, setShouldThrow] = useState(false);
    const dispatch = useAppDispatch();
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
        vs_currency: currency,
        per_page: '10',
        page: '2'
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

    if (shouldThrow) {
        throw new Error('Error test from component');
    }

    return (
        <div>
            <button onClick={() => setShouldThrow(true)}>click to crash</button>
            <table>
                <thead>
                    <tr>
                       <th>#</th>
                        <th>Coin</th>
                        <th>Price</th>
                        <th>1h</th>
                        <th>24h</th>
                        <th>Volume</th>
                        <th>Market Cap</th>
                        <th>Last 7 Days</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(data => <AssetListItem key={data.id} marketData={data} currency={currency}/>)}
                </tbody>
            </table>
        </div>
    )
}
