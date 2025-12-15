process.env.COINGECKO_API_KEY_SECRET = 'TEST_API_KEY';
const { fetchMarketData } = require('../../src/services/cryptoService');

const { rest, http, HttpResponse } = require('msw');
import { server } from '../../src/mocks/node';

describe('fetchMarketData', () => {
    it('1. Should correctly build the URL with default and custom parameters', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', ({ request }: any) => {
                const url = new URL(request.url);

                expect(url.searchParams.get('vs_currency')).toBe('eur');
                expect(url.searchParams.get('per_page')).toBe('10');
                expect(url.searchParams.get('order')).toBe('volume_desc');
                expect(url.searchParams.get('price_change_percentage')).toBe('1h,24h,7d');
                expect(request.headers.get('x-cg-demo-api-key')).toBe('TEST_API_KEY');

                return HttpResponse.json({ result: 'ok' }, { status: 200 });
            })
        );

        await fetchMarketData({
            vs_currency: 'eur',
            per_page: '10',
            order: 'volume_desc',
        });

        expect.assertions(5);
    });

    it('2. Should throw an error if vs_currency is missing', async () => {
        // @ts-ignore
        await expect(fetchMarketData({})).rejects.toThrow(
            "The required parameter 'vs_currency' is not available."
        );
    });

    it('3. Should throw an error for an unsuccessful HTTP status - 401)', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
                return HttpResponse.json({ message: 'Unauthorized Access' }, { status: 401 });
            })
        );

        await expect(fetchMarketData({ vs_currency: 'usd' })).rejects.toThrow(
            'Failed to retrieve data from API.'
        );
    });
});
