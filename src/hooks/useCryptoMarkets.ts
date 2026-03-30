'use client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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

  // We stringify options to have a stable dependency even if the object reference changes.
  // This ensures useMemo only runs when the actual values inside options change.
  const optionsSerialized = JSON.stringify(options);

  const params = useMemo(
    () => ({
      ...defaultOptions,
      ...options,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [optionsSerialized],
  );

  const stringifiedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );
  // params -> stable ref
  const queryKey = [MARKETS_QUERY_KEY, params];

  const queryFn = async () => {
    const urlParams = new URLSearchParams(stringifiedParams).toString();
    const url = `/api/markets?${urlParams}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error while fetching data.');
    }

    const data = await response.json();

    return data;
  };

  return useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    // React Query won’t even request data from the server for a minute
    // if the user is navigating/clicking around.
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    gcTime: 5 * 60 * 1000, // in garbage colector -> 5min
  });
}
