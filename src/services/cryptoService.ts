import { CoinMarketParams, CoinsMarketParamsSchema } from '../types/yup';

const API_KEY = process.env.COINGECKO_API_KEY_SECRET;
const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function fetchMarketData(params: CoinMarketParams) {
    if (!API_KEY) {
            throw new Error("COINGECKO_API_KEY_SECRET is not available.");
    }
    
    if (!params.vs_currency) {
        throw new Error("The required parameter 'vs_currency' is not available.");
    }

    const defaultParams = {
        per_page: '100',
        page: '1',
        sparkline: true,
        price_change_percentage: '1h,24h,7d',
        order: 'market_cap_desc',
    };

    const finalParams: any = {
        ...defaultParams,
        ...params, 
    };

    const queryParams = new URLSearchParams(finalParams).toString();
    const url = `${BASE_URL}/coins/markets?${queryParams}`;

    try {
        await CoinsMarketParamsSchema.validate(finalParams, {
            abortEarly: false,
            strict: false
        });
        
        const response = await fetch(url, {
            headers: {
                'x-cg-demo-api-key': API_KEY, 
                'Content-Type': 'application/json'
            },
            cache: 'no-store' // fresh data
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`CoinGecko API error: status=${response.status}, body=${errorBody}`);

            let userMessage = 'Failed to retrieve data from API.';
            if (response.status === 401 || response.status === 403) {
                userMessage = 'Invalid CoinGecko API credentials.';
            } else if (response.status === 429) {
                userMessage = 'CoinGecko rate limit exceeded, please try again later.';
            } else if (response.status >= 500) {
                userMessage = 'CoinGecko server error, please try again later.';
            }
   
            throw new Error(`${userMessage} (status: ${response.status})`);
        }
        let data = await response.json();

        // env-test, case: coingecko res => string data type 
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (err) { 
                console.warn('Failed to parse JSON string from response', err);
            }
        }
        
        return data;

    } catch (error: any) {
        console.error('Market data error:', error.message);
        throw new Error('Failed to retrieve data from API.');
    }
}

