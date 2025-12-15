import * as yup from 'yup';
import { currencies } from '../mocks/data/marketDataMock';

export const CoinMarketDataSchema = yup.object({
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
}).strict()

export const CoinMarketDataListSchema = yup.array(CoinMarketDataSchema);

export interface CoinMarketData extends yup.InferType<typeof CoinMarketDataSchema> {}

const transformToNumber = (originalValue: any): number | null => {
    if (originalValue === null || originalValue === undefined || originalValue === '') {
        return null;
    }
    const numValue = parseFloat(originalValue);
    return isNaN(numValue) ? null : numValue;
};

export const CoinsMarketParamsSchema = yup.object({
    vs_currency: yup
        .string()
        .oneOf(currencies, `Currency must be one of: ${currencies.join(', ')}`)
        .required('vs_currency is required.'), // Key parameter, should be required

    per_page: yup
        .number()
        .transform(transformToNumber)
        .nullable()
        .min(1, 'There must be at least 1 result per page.')
        .max(250, 'A maximum of 250 results per page.') // CoinGecko limit
        .integer('Must be an integer value.')
        .default(15), 
    
    page: yup
        .number()
        .transform(transformToNumber)
        .nullable()
        .min(1, 'Page number must be greater or equal to 1.')
        .max(1000, 'Must be between 1 and 1000')
        .integer('Must be an integer value.')
        .default(1),
    
    order: yup
        .string()
        .oneOf(['market_cap_desc', 'market_cap_asc', 'volume_desc', 'volume_asc'], 
            'Invalid sorting option.')
        .default('market_cap_desc'), 
    
    sparkline: yup
        .boolean()
        .transform((value, originalValue) => {
            if (typeof originalValue === 'boolean') return originalValue;
            if (originalValue === null || originalValue === undefined || originalValue === '') return null;
            if (typeof originalValue === 'string') {
                const lowerCaseValue = originalValue.toLowerCase();
                if (lowerCaseValue === 'true' || lowerCaseValue === '1' || lowerCaseValue === 'yes') return true;
                if (lowerCaseValue === 'false' || lowerCaseValue === '0' || lowerCaseValue === 'no') return false;
            }
            return null;
        })
        .nullable()
        .default(false), 
    
    price_change_percentage: yup
        .string()
        .optional()
        .default('1h,24h,7d') 
        .test('is-valid-timeframe-csv', 
            `Field contains invalid options or duplicates. Allowed: ${['1h', '24h', '7d'].join(', ')}`,
            (value) => {
                if (!value) {
                    return true; 
                }

                const transformedArray = value
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

                const isValid = transformedArray.every(item => ['1h', '24h', '7d'].includes(item));
                if (!isValid) {
                    return false;
                }

                // Validate uniqueness: check for duplicates
                const uniqueElements = new Set(transformedArray);
                if (uniqueElements.size !== transformedArray.length) {
                    return false; // Duplicates found
                }

                return true;
            })
        .transform((value) =>  value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0).join(','))
}).noUnknown(true, 'Unknown object keys'); // Reject unknown object keys

export interface CoinMarketParams extends yup.InferType<typeof CoinsMarketParamsSchema> {}