'use client';
import { useCryptoMarkets } from "../hooks/useCryptoMarkets";

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
    if(data) console.log('data',data)
    return (
        <div>
            <h2>Assets List</h2>
        </div>
    )
}