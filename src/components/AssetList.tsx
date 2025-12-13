'use client';
import { useCryptoMarkets } from "../hooks/useCryptoMarkets";
import { AssetListItem } from "./AssetListItem";

export function AssetList() {
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
            <h1>Assets List</h1>
            <ul>
                {
                    data.map(data => <AssetListItem key={data.id} marketData={data}/>)
                }
            </ul>
        </div>
    )
}