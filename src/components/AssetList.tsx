'use client';
import { useCryptoMarkets } from "../hooks/useCryptoMarkets";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { RootState } from "../store/store";
import { AssetListItem } from "./AssetListItem";
import { setCurrency } from "../store/uiSlice";

export function AssetList() {
    const currency = useAppSelector((state: RootState) => state.currency);
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
        per_page: '15',
        page: '2' 
    });
 
    if (isLoading) {
        return <div>Loading...</div>
    }
    
    if (isError) {
        return <div>Error loading assets</div>;
    }

    if (!Array.isArray(data)) {
        return <div>No data</div>;
    }

    return (
        <div>
            <button onClick={() => dispatch(setCurrency('eur'))}>set curr</button>
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