import * as yup from 'yup';
import { currencies } from '../mocks/data/marketDataMock';

export const CoinMarketDataSchema = yup
  .object({
    id: yup.string().required('Required value'),
    symbol: yup.string().required('Required value'),
    name: yup.string().required('Required value'),
    image: yup.string().url().default(''),
    current_price: yup.number().nullable().default(0),
    market_cap: yup.number().nullable().default(0),
    market_cap_rank: yup.number().nullable().default(0),
    total_volume: yup.number().nullable().default(0),
    price_change_percentage_1h_in_currency: yup.number().nullable().default(0),
    price_change_percentage_24h_in_currency: yup.number().nullable().default(0),
    price_change_percentage_7d_in_currency: yup.number().nullable().default(0),
  })
  .strict();

export const CoinDetailDataSchema = yup.object({
  stats: yup
    .object({
      price: yup.number().positive('Price must be a positive number').required('Price is required'),
      marketCap: yup
        .number()
        .positive('Market cap must be a positive number')
        .required('Market cap is required'),
      volume: yup.number().min(0, 'Volume cannot be negative').required('Volume is required'),
      supply: yup
        .number()
        .min(0, 'Circulating supply cannot be negative')
        .required('Supply is required'),
      change24h: yup.number().required('24h trend is required'),
      rank: yup
        .number()
        .integer('Rank must be an integer')
        .positive('Rank must be a positive number')
        .required('Market cap rank is required')
        .nullable(),
      high24h: yup
        .number()
        .positive('Price must be positive')
        .required('High 24h is required')
        .nullable(),
      low24h: yup
        .number()
        .positive('Price must be positive')
        .required('Low 24h is required')
        .nullable(),
      ath: yup.number().positive('ATH must be positive').required('ATH is required').nullable(),
      athChange: yup.number().required('ATH change percentage is required').nullable(),
    })
    .required(),

  chart: yup
    .object({
      '1': yup.array().of(yup.array().of(yup.number().required())).required(),
      '7': yup.array().of(yup.array().of(yup.number().required())).required(),
      '30': yup.array().of(yup.array().of(yup.number().required())).required(),
      '90': yup.array().of(yup.array().of(yup.number().required())).required(),
      '365': yup.array().of(yup.array().of(yup.number().required())).required(),
    })
    .required('Chart data is required'),
});

export type CoinDetailData = yup.InferType<typeof CoinDetailDataSchema>;

export const CoinMarketDataListSchema = yup.array(CoinMarketDataSchema);

export type CoinMarketData = yup.InferType<typeof CoinMarketDataSchema>;

const transformToNumber = (originalValue: unknown): number | null => {
  if (originalValue === null || originalValue === undefined || originalValue === '') {
    return null;
  }
  const numValue = parseFloat(String(originalValue));
  return isNaN(numValue) ? null : numValue;
};

export const CoinsMarketParamsSchema = yup
  .object({
    vs_currency: yup
      .string()
      .oneOf(currencies, `Currency must be one of: ${currencies.join(', ')}`)
      .required('vs_currency is required.'), // Key parameter, should be required

    per_page: yup
      .number()
      .notRequired()
      .transform(transformToNumber)
      .nullable()
      .min(1, 'There must be at least 1 result per page.')
      .max(250, 'A maximum of 250 results per page.') // CoinGecko limit
      .integer('Must be an integer value.')
      .default(15),

    page: yup
      .number()
      .transform(transformToNumber)
      .notRequired()
      .nullable()
      .min(1, 'Page number must be greater or equal to 1.')
      .max(1000, 'Must be between 1 and 1000')
      .integer('Must be an integer value.')
      .default(1),

    order: yup
      .string()
      .notRequired()
      .oneOf(
        ['market_cap_desc', 'market_cap_asc', 'volume_desc', 'volume_asc'],
        'Invalid sorting option.',
      )
      .default('market_cap_desc'),

    sparkline: yup
      .boolean()
      .notRequired()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'boolean') return originalValue;
        if (originalValue === null || originalValue === undefined || originalValue === '')
          return null;
        if (typeof originalValue === 'string') {
          const lowerCaseValue = originalValue.toLowerCase();
          if (lowerCaseValue === 'true' || lowerCaseValue === '1' || lowerCaseValue === 'yes')
            return true;
          if (lowerCaseValue === 'false' || lowerCaseValue === '0' || lowerCaseValue === 'no')
            return false;
        }
        return null;
      })
      .nullable()
      .default(false),

    price_change_percentage: yup
      .string()
      .notRequired()
      .default('1h,24h,7d')
      .test(
        'is-valid-timeframe-csv',
        `Field contains invalid options or duplicates. Allowed: ${['1h', '24h', '7d'].join(', ')}`,
        (value) => {
          if (!value) {
            return true;
          }

          const transformedArray = value
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          const isValid = transformedArray.every((item) => ['1h', '24h', '7d'].includes(item));
          if (!isValid) {
            return false;
          }

          // Validate uniqueness: check for duplicates
          const uniqueElements = new Set(transformedArray);
          if (uniqueElements.size !== transformedArray.length) {
            return false; // Duplicates found
          }

          return true;
        },
      )
      .transform((value) =>
        value
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .join(','),
      ),
  })
  .noUnknown(true, 'Unknown object keys'); // Reject unknown object keys

export type CoinMarketParams = yup.InferType<typeof CoinsMarketParamsSchema>;

export interface GlobalData {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: {
    btc: number;
    eth: number;
    [key: string]: number;
  };
  market_cap_change_percentage_24h_usd: number;
}

export const GlobalDataSchema = (currency: string) =>
  yup
    .object({
      total_market_cap: yup
        .object({
          [currency]: yup.number().required(`Price in ${currency} is required`),
        })
        .required(),
      total_volume: yup
        .object({
          [currency]: yup.number().required(`Volume in ${currency} is required`),
        })
        .required(),
      market_cap_percentage: yup
        .object({
          btc: yup.number().required(),
          eth: yup.number().required(),
        })
        .required(),
      market_cap_change_percentage_24h_usd: yup.number().required(),
    })
    .noUnknown();

export const VsCurrencySchema = yup
  .object({
    currency: yup
      .string()
      .lowercase()
      .trim()
      .required('Currency is required')
      .oneOf([...currencies], ({ values }) => `Unsupported currency. Please use one of: ${values}`)
      .default('usd'),
  })
  .noUnknown();

export type GlobalDataParams = yup.InferType<typeof VsCurrencySchema>;

export const CoinDetailParamsSchema = yup
  .object({
    currency: yup
      .string()
      .lowercase()
      .trim()
      .required('Currency is required')
      .oneOf([...currencies], ({ values }) => `Unsupported currency. Please use one of: ${values}`)
      .default('usd'),
    coinId: yup
      .string()
      .lowercase()
      .trim()
      .required('coinId is required')
      .min(2, 'coinId must be at least 2 characters')
      .max(50, 'coinId is too long')
      .default('bitcoin'),
    days: yup.string().oneOf(['1', '7', '30', '90', '365'], 'Invalid time range').default('1'),
  })
  .noUnknown();

export type CoinDetailParams = yup.InferType<typeof CoinDetailParamsSchema>;

export const SearchQuerySchema = yup
  .object({
    query: yup
      .string()
      .trim()
      .required('Search query is required')
      .min(2, 'Search query must be at least 2 characters long')
      .max(100, 'Search query is too long')
      .matches(/^[a-zA-Z0-9\s-]+$/, 'Search query contains invalid characters'),
  })
  .noUnknown();

export type SearchQuery = yup.InferType<typeof SearchQuerySchema>;

export const SearchResponseSchema = yup.object({
  coins: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        name: yup.string().required(),
        symbol: yup.string().required(),
        thumb: yup.string().required(),
        market_cap_rank: yup.number().nullable(),
      }),
    )
    .required(),
});

export type SearchResponse = yup.InferType<typeof SearchResponseSchema>;
