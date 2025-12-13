export interface CoinMarketData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    price_change_percentage_1h_in_currency: number;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d_in_currency: number | null;
}