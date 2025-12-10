import 'server-only' // only server run
import { MarketDataProps } from '../types/props';

const API_KEY = process.env.COINGECKO_API_KEY_SECRET;
const BASE_URL = 'https://api.coingecko.com/api/v3';

const params = {
    vs_currency: 'eur',        
    per_page: 100,             
    page: 1,                  
    order: 'market_cap_desc',  
    sparkline: true,         
    price_change_percentage: '1h,24h,7d', 
    locale: 'fr'               
};

export async function fetchMarketlData(params = {} as MarketDataProps) {
 if (!API_KEY) {
            throw new Error("COINGECKO_API_KEY_SECRET is not available.");
        }
        
        if (!params.vs_currency) {
            throw new Error("The required parameter 'vs_currency' is not available..");
        }
        
        const defaultParams = {
            per_page: `100`,
            page: `1`,
            sparkline: `true`, 
            price_change_percentage: '1h,24h,7d',
            ...params 
        };

        const queryParams = new URLSearchParams(defaultParams).toString();
        
        const url = `${BASE_URL}/coins/markets?${queryParams}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'x-cg-demo-api-key': API_KEY, 
                    'Content-Type': 'application/json'
                },
                cache: 'no-store' // fresh data
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`CoinGecko API status: ${response.status}: ${errorBody}`);
            }

            return response.json();

        } catch (error) {
            console.error('Market data error:', error?.message);
            throw new Error('Failed to retrieve data from API.');
        }
    }
}