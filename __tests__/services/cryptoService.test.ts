import { CoinGeckoAdapter } from '@/adapters/adapters/CoinGeckoAdapter';
const { rest, http, HttpResponse } = require('msw');
import { marketDataMock } from '@/mocks/data/marketDataMock';
import { server } from '@/mocks/node';

const Request = global.Request;
const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);

describe('fetchMarketData', () => {
    it('should correctly build the URL with default and custom parameters', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', ({ request }: { request: Request }) => {
                const url = new URL(request.url);

                expect(url.searchParams.get('vs_currency')).toBe('eur');
                expect(url.searchParams.get('per_page')).toBe('10');
                expect(url.searchParams.get('order')).toBe('volume_desc');
                expect(url.searchParams.get('price_change_percentage')).toBe('1h,24h,7d');
                expect(request.headers.get('x-cg-demo-api-key')).toBe('TEST_API_KEY');

                return HttpResponse.json(marketDataMock);
            })
        );

        await adapter.fetchMarketData({
            vs_currency: 'eur',
            per_page: '10',
            order: 'volume_desc',
        });

        expect.assertions(5);
    });

    it('should return data when only the required argument is provided', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
                return HttpResponse.json(marketDataMock);
            })
        );

        const result = await adapter.fetchMarketData({ vs_currency: 'usd' });
        expect(result).toStrictEqual(marketDataMock);
    });

    it('should handle API responses that return stringified JSON', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
                return HttpResponse.text(JSON.stringify(marketDataMock));
            })
        );

        const result = await adapter.fetchMarketData({ vs_currency: 'usd' });
        expect(result).toStrictEqual(marketDataMock);
    });

    it('should throw an error if vs_currency is missing', async () => {
        // @ts-ignore
        await expect(adapter.fetchMarketData({})).rejects.toThrow(
            "The required parameter 'vs_currency' is not available."
        );
    });

    it('should throw a generic error for 401 Unauthorized status', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
                return new HttpResponse(null, { status: 401 });
            })
        );

        await expect(adapter.fetchMarketData({ vs_currency: 'usd' })).rejects.toThrow(
            'Invalid CoinGecko API credentials'
        );
    });
});
