'use client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { CoinMarketData, CoinMarketDataListSchema, CoinMarketParams, CoinsMarketParamsSchema } from '../types/yup';

const MARKETS_QUERY_KEY = 'cryptoMarkets';

export function useCryptoMarkets(options = {}) {
    const defaultOptions = {
        vs_currency: 'usd',
        per_page: 100,
        page: 1,
        order: 'market_cap_desc',
        sparkline: true,
        price_change_percentage: '1h,24h,7d',
    };

    const params: {[key: string]: string | number | boolean} = useMemo(() => ({
        ...defaultOptions,
        ...options,
    }), [options]);

    const stringifiedParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
    );

    const queryKey = [MARKETS_QUERY_KEY, options];

    const queryFn = async () => {
        const urlParams = new URLSearchParams(stringifiedParams).toString();
        const url = `/api/markets?${urlParams}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error while fetching data.');
        }

        let data = await response.json();

        // test env chceck
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (err) {
                console.warn('Failed to parse JSON string from response', err);
            }
        }

        return data;
    };

    return useQuery({
        queryKey: queryKey,
        queryFn: queryFn,

        // staleTime: 5 * 60 * 1000, // ex: 5 min interval
        refetchInterval: 60 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}
