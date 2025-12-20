import { marketsRateLimit } from "@/lib/rateLimit";
import { getClientIdentifier } from "@/lib/rateLimit";
import { GET } from '@/app/api/markets/route';
import { marketDataMock } from "@/mocks/data/marketDataMock";
import { CoinGeckoAdapter } from "@/adapters/adapters/CoinGeckoAdapter";

jest.mock('@/lib/rateLimit', () => ({
    marketsRateLimit: {
        limit: jest.fn()
    },
    getClientIdentifier: jest.fn(() => 'test-ip')
}));

jest.mock("@/adapters/adapters/CoinGeckoAdapter");

const mockMarketsRateLimit = marketsRateLimit as jest.Mocked<typeof marketsRateLimit>;
const mockGetClientIdentifier = getClientIdentifier as jest.MockedFunction<typeof getClientIdentifier>;

const mockFetchMarketData = jest.fn();

describe('api/markets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on the prototype method - this works with singleton instances
        jest.spyOn(CoinGeckoAdapter.prototype, 'fetchMarketData').mockImplementation(mockFetchMarketData);
        mockMarketsRateLimit.limit.mockResolvedValue({
            success: true,
            limit: 60,
            remaining: 59,
            reset: Date.now() + 60000,
        } as Awaited<ReturnType<typeof marketsRateLimit['limit']>>);
        mockGetClientIdentifier.mockReturnValue('test-ip');
    });

    describe('Success (200)', () => {
        it('should return 200 status with data for required parameters', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=usd');
            const res = await GET(req as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toStrictEqual(marketDataMock);
            expect(mockFetchMarketData).toHaveBeenCalledWith(expect.objectContaining({vs_currency: 'usd'}));
        });

        it('should return rate limit headers on successful response', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=usd');
            const res = await GET(req as any);

            expect(res.status).toBe(200);
            expect(res.headers.get('X-RateLimit-Limit')).toBe('60');
            expect(res.headers.get('X-RateLimit-Remaining')).toBe('59');
            expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
        });

        it('should validate and pass all query parameters to fetchMarketData', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=eur&per_page=50&page=2&order=market_cap_asc');
            const res = await GET(req as any);

            expect(res.status).toBe(200);
            expect(mockFetchMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    vs_currency: 'eur',
                    per_page: 50,
                    page: 2,
                    order: 'market_cap_asc',
                })
            );
        });
    });

    describe('Parameter Validation (400)', () => {
        it('should return 400 when per_page is out of range (too low)', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=eur&per_page=50&page=0&order=market_cap_asc');
            const res = await GET(req as any);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body.error).toBe('Invalid parameters');
            expect(mockFetchMarketData).not.toHaveBeenCalled();
        });

        it('should return 400 when per_page is out of range (too high)', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=eur&per_page=50&page=9999&order=market_cap_asc');
            const res = await GET(req as any);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body.error).toBe('Invalid parameters');
            expect(mockFetchMarketData).not.toHaveBeenCalled();
        });

        it('should return 400 when price_change_percentage has duplicates', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=usd&price_change_percentage=1h,1h,24h');
            const res = await GET(req as any);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body.error).toBe('Invalid parameters');
            expect(mockFetchMarketData).not.toHaveBeenCalled();
        });

        it('should return 400 when order has invalid value', async () => {
            mockFetchMarketData.mockResolvedValue(marketDataMock);

            const req = new Request('http://localhost/api/markets?vs_currency=usd&order=invalid_order');
            const res = await GET(req as any);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body.error).toBe('Invalid parameters');
            expect(mockFetchMarketData).not.toHaveBeenCalled();
        });
    });

    describe('Rate Limiting (429)', () => {
        it('should return 429 when rate limit is exceeded', async () => {
            mockMarketsRateLimit.limit.mockResolvedValue({
                success: false,
                limit: 60,
                remaining: 0,
                reset: Date.now() + 60000,
                pending: Promise.resolve(0),
            });

            const req = new Request('http://localhost/api/markets?vs_currency');
            const res = await GET(req as any);

            expect(res.status).toBe(429);
            const body = await res.json();
            expect(body.error).toBe('Too many requests');
            expect(body.message).toBe('Rate limit exceeded. Please try again later.');
            expect(body.retryAfter).toBeGreaterThan(0);
            expect(mockFetchMarketData).not.toHaveBeenCalled();
        });

        it('should include rate limit headers in 429 response', async () => {
            mockMarketsRateLimit.limit.mockResolvedValue({
                success: false,
                limit: 60,
                remaining: 0,
                reset: Date.now() + 60000,
                pending: Promise.resolve(0),
            });

            const req = new Request('http://localhost/api/markets?vs_currency=usd');
            const res = await GET(req as any);

            expect(res.headers.get('X-RateLimit-Limit')).toBe('60');
            expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
            expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
            expect(res.headers.get('Retry-After')).toBeTruthy();
        });

        it('should not call fetchMarketData when rate limit is exceeded', async () => {
            mockMarketsRateLimit.limit.mockResolvedValue({
                success: false,
                limit: 60,
                remaining: 0,
                reset: Date.now() + 60000,
                pending: Promise.resolve(0),
            });

            const req = new Request('http://localhost/api/markets?vs_currency=usd');
            await GET(req as any);

            expect(mockFetchMarketData).not.toHaveBeenCalled();
        });
    });

    describe('Server Errors (500)', () => {
        it('should return 500 when fetchMarketData throws an error', async () => {
            mockFetchMarketData.mockRejectedValue(new Error('API connection failed'));

            const req = new Request('http://localhost/api/markets?vs_currency=usd');
            const res = await GET(req as any);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred while processing your request.');
        });

        it('should not leak internal error details to client', async () => {
            const internalError = new Error('Sensitive database connection string');
            mockFetchMarketData.mockRejectedValue(internalError);

            const req = new Request('http://localhost/api/markets?vs_currency=usd');
            const res = await GET(req as any);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.message).not.toContain('Sensitive');
            expect(body.message).not.toContain('database');
        });
    });
});

// API route `/api/markets`
// codes
//
// 200 - Success ok
// /400 - Bad Request
// /500 - Internal Server Error
// /429 - Too Many Request
//
// rate limit headers,
// validation error mapping
