'use client';
import { RootState } from '@/store/store';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const COIN_QUERY_KEY = 'cryptoGlobal';

export function useCoinData(coinId: string) {
   const currency = useSelector((state: RootState) => state.ui.currency);
    const queryKey = [COIN_QUERY_KEY, currency, coinId];

    const queryFn = async () => {
        const params = { currency: currency.code, coinId };
        const urlParams = new URLSearchParams(params).toString();
        const url = `/api/coin?${urlParams}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error while fetching data.');
        }

        let data = await response.json();

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
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true,
        gcTime: 5 * 60 * 1000,
    });

}
