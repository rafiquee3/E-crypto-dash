'use client';
import { useCryptoMarkets } from "../hooks/useCryptoMarkets";
import { AssetListItem } from "./AssetListItem";

export function AssetList() {
    const currency = 'usd';
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
        vs_currency: 'usd', 
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