import * as yup from 'yup';

export const CoinMarketSchema = yup.object({
    id: yup.string().required(),
    symbol: yup.string().required(),
    name: yup.string().required(),
    current_price: yup.number().nullable().default(0),
    market_cap: yup.number().nullable().default(0),
    market_cap_rank: yup.number().nullable().default(0),
    total_volume: yup.number().nullable().default(0),
    price_change_percentage_1h_in_currency: yup.number().nullable().default(0),
    price_change_percentage_24h_in_currency: yup.number().nullable().default(0),
    price_change_percentage_7d_in_currency: yup.number().nullable().default(0),
}).strict();

export const CoinMarketListSchema = yup.array(CoinMarketSchema);

export interface CoinMarketData extends yup.InferType<typeof CoinMarketSchema> {}