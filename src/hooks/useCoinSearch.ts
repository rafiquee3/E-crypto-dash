'use client';
import { useQuery } from '@tanstack/react-query';

const COIN_SEARCH_KEY = 'coinSearch';

export function useCoinSearch(query: string) {
    const queryKey = [COIN_SEARCH_KEY, query];

    const queryFn = async () => {
      if (!query || query.length < 2) return { coins: [] };

      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      return response.json();
    };

    return useQuery({
        queryKey: queryKey,
        queryFn: queryFn,
        staleTime: 5 * 60 * 1000,
        enabled: query.length >= 2,
        gcTime: 5 * 60 * 1000,
    });
}
