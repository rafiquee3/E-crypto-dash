import 'server-only' // only server run
import { MarketDataProps } from '../types/props';

const API_KEY = process.env.COINGECKO_API_KEY_SECRET;
const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function fetchMarketData(params: MarketDataProps) {
    console.log('paramsfetchMarD', params)
    if (!API_KEY) {
            throw new Error("COINGECKO_API_KEY_SECRET is not available.");
    }
    
    if (!params.vs_currency) {
        throw new Error("The required parameter 'vs_currency' is not available..");
    }

    const defaultParams = {
        per_page: '100',
        page: '1',
        sparkline: true,
        price_change_percentage: '1h,24h,7d',
        order: 'market_cap_desc',
    };

    const finalParams = {
        ...defaultParams,
        ...params, 
    };

    const queryParams = new URLSearchParams(finalParams).toString();
    const url = `${BASE_URL}/coins/markets?${queryParams}`;
    // MY: GET /api/markets?vs_currency=usd&perPage=100&page=1&order=market_cap_desc&sparkline=true&priceChangePercentage=1h%2C24h%2C7d
    // EX: https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&names=Bitcoin&symbols=btc&category=layer-1&price_change_percentage=1h'
    // https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd
    try {
        console.log('API CALL URL', url)
        console.log('KEY', API_KEY)
        const response = await fetch(url, {
            headers: {
                'x-cg-demo-api-key': API_KEY, 
                'Content-Type': 'application/json'
            },
            cache: 'no-store' // fresh data
        });
        console.log('resp', response)
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`CoinGecko API status: ${response.status}: ${errorBody}`);
        }

        return response.json();

    } catch (error: any) {
        console.error('Market data error:', error.message);
        throw new Error('Failed to retrieve data from API.');
    }
}

