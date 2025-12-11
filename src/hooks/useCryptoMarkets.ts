'use client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// The key that identifies this specific piece of data in the TanStack Query cache.
const MARKETS_QUERY_KEY = 'cryptoMarkets';

export function useCryptoMarkets(options = {}) {
    const defaultOptions = {
        vs_currency: 'usd',
        per_page: '100',
        page: '1',
        order: 'market_cap_desc',
        sparkline: true,
        priceChangePercentage: '1h,24h,7d', 
    };
    
    const params: any = useMemo(() => ({
        ...defaultOptions,
        ...options,
    }), [options]);

    // Create a dynamic query key.
    // TanStack Query automatically refreshes data when any key element changes
    const queryKey = [MARKETS_QUERY_KEY, options];

    // The function to fetch data, which is only called when the data is not in the cache.
    const queryFn = async () => {
        const urlParams = new URLSearchParams(params).toString();
        const url = `/api/markets?${urlParams}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error while fetching data.');
        }

        return response.json();
    };

    return useQuery({
        queryKey: queryKey,
        queryFn: queryFn,

        // staleTime: 5 * 60 * 1000, // ex: 5 min interval 
        refetchInterval: 60 * 1000, 
        refetchOnWindowFocus: true,
    });
}