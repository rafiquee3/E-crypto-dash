import { CoinGeckoAdapter } from '@/adapters/adapters/CoinGeckoAdapter';
const { rest, http, HttpResponse } = require('msw');
import {
  marketDataMock,
  globalDataMock,
  coinDetailMock,
  coinChartMock,
} from '@/mocks/data/marketDataMock';
import { server } from '@/mocks/node';

const Request = global.Request;
const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);

describe('fetchMarketData', () => {
  it('should correctly build the URL with default and custom parameters', async () => {
    server.use(
      http.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        ({ request }: { request: Request }) => {
          const url = new URL(request.url);

          expect(url.searchParams.get('vs_currency')).toBe('eur');
          expect(url.searchParams.get('per_page')).toBe('10');
          expect(url.searchParams.get('order')).toBe('volume_desc');
          expect(url.searchParams.get('price_change_percentage')).toBe('1h,24h,7d');
          expect(request.headers.get('x-cg-demo-api-key')).toBe('TEST_API_KEY');

          return HttpResponse.json(marketDataMock);
        },
      ),
    );

    await adapter.fetchMarketData({
      vs_currency: 'eur',
      per_page: 10,
      order: 'volume_desc',
    });

    expect.assertions(5);
  });

  it('should return data when only the required argument is provided', async () => {
    server.use(
      http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
        return HttpResponse.json(marketDataMock);
      }),
    );

    const result = await adapter.fetchMarketData({ vs_currency: 'usd' });
    expect(result).toStrictEqual(marketDataMock);
  });

  it('should handle API responses that return stringified JSON', async () => {
    server.use(
      http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
        return HttpResponse.text(JSON.stringify(marketDataMock));
      }),
    );

    const result = await adapter.fetchMarketData({ vs_currency: 'usd' });
    expect(result).toStrictEqual(marketDataMock);
  });

  it('should throw an error if vs_currency is missing', async () => {
    // @ts-ignore
    await expect(adapter.fetchMarketData({})).rejects.toThrow(
      "The required parameter 'vs_currency' is not available.",
    );
  });

  it('should throw a generic error for 401 Unauthorized status', async () => {
    server.use(
      http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    await expect(adapter.fetchMarketData({ vs_currency: 'usd' })).rejects.toThrow(
      'Invalid CoinGecko API credentials',
    );
  });
});

describe('fetchGlobalData', () => {
  it('should correctly fetch and validate global data', async () => {
    server.use(
      http.get('https://api.coingecko.com/api/v3/global', () => {
        return HttpResponse.json(globalDataMock);
      }),
    );

    const result = await adapter.fetchGlobalData('usd');
    expect(result).toStrictEqual(globalDataMock.data);
  });

  it('should throw validation error if global data is missing required fields', async () => {
    const invalidGlobalDataMock = {
      data: {
        total_market_cap: { usd: 2500000000000 },
        // missing total_volume
        market_cap_percentage: { btc: 50.1, eth: 17.5 },
        market_cap_change_percentage_24h_usd: -1.2,
      },
    };

    server.use(
      http.get('https://api.coingecko.com/api/v3/global', () => {
        return HttpResponse.json(invalidGlobalDataMock);
      }),
    );

    await expect(adapter.fetchGlobalData('usd')).rejects.toThrow();
  });

  it('should throw Rate limit exceeded error for 429 status', async () => {
    server.use(
      http.get('https://api.coingecko.com/api/v3/global', () => {
        return new HttpResponse(null, { status: 429 });
      }),
    );

    await expect(adapter.fetchGlobalData('usd')).rejects.toThrow('Rate limit exceeded');
  });

  it('should throw Invalid credentials error for 401 status', async () => {
    server.use(
      http.get('https://api.coingecko.com/api/v3/global', () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    await expect(adapter.fetchGlobalData('usd')).rejects.toThrow(
      'Invalid CoinGecko API credentials',
    );
  });
});

describe('fetchCoinData', () => {
  const coinId = 'bitcoin';
  const currency = 'usd';

  it('should correctly fetch and validate coin data with days parameter', async () => {
    const days = '7';
    server.use(
      http.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, () => {
        return HttpResponse.json(coinDetailMock);
      }),
      http.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        ({ request }: { request: Request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('vs_currency')).toBe(currency);
          expect(url.searchParams.get('days')).toBe(days);
          return HttpResponse.json(coinChartMock);
        },
      ),
    );

    const result = await adapter.fetchCoinData(currency, coinId, days);

    expect(result.stats.price).toBe(50000);
    expect(result.chart).toHaveLength(2);
    expect.assertions(4);
  });

  it('should use default days=1 if not provided', async () => {
    server.use(
      http.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, () => {
        return HttpResponse.json(coinDetailMock);
      }),
      http.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        ({ request }: { request: Request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('days')).toBe('1');
          return HttpResponse.json(coinChartMock);
        },
      ),
    );

    await adapter.fetchCoinData(currency, coinId);
    expect.assertions(1);
  });

  it('should throw error if one of the requests fails', async () => {
    server.use(
      http.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
      http.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, () => {
        return HttpResponse.json(coinChartMock);
      }),
    );

    await expect(adapter.fetchCoinData(currency, coinId)).rejects.toThrow();
  });
});
