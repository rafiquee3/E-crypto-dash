'use client';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const GLOBAL_QUERY_KEY = 'cryptoGlobal';

export function useGlobalData() {
    const currency = useSelector((state: RootState) => state.ui.currency);
    const queryKey = [GLOBAL_QUERY_KEY, currency];

    const queryFn = async () => {
        const params = { currency };
        const urlParams = new URLSearchParams(params).toString();
        const url = `/api/market/global?${urlParams}`;
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
