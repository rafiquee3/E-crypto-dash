import { GET } from '@/app/api/markets/global/route';
import { CoinGeckoAdapter } from '@/adapters/adapters/CoinGeckoAdapter';
import { checkRateLimit } from '@/guards/rateLimitGuard';
import { validateGlobalParams } from '@/guards/validationGuard';
import { globalDataMock } from '@/mocks/data/marketDataMock';

jest.mock('@/adapters/adapters/CoinGeckoAdapter');
jest.mock('@/guards/rateLimitGuard', () => ({
  checkRateLimit: jest.fn(),
}));
jest.mock('@/guards/validationGuard', () => ({
  validateGlobalParams: jest.fn(),
}));
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}));

const mockCheckRateLimit = checkRateLimit as jest.Mock;
const mockValidateGlobalParams = validateGlobalParams as jest.Mock;
const mockFetchGlobalData = jest.fn();

describe('api/markets/global route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (CoinGeckoAdapter as jest.Mock).mockImplementation(() => ({
      fetchGlobalData: mockFetchGlobalData,
    }));

    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });

    mockValidateGlobalParams.mockResolvedValue({
      success: true,
      data: { currency: 'usd' },
    });
  });

  describe('Success (200)', () => {
    it('should return global market data when query is valid', async () => {
      mockFetchGlobalData.mockResolvedValue(globalDataMock);

      const req = new Request('http://localhost/api/markets/global?currency=usd');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toStrictEqual(globalDataMock);
      expect(mockFetchGlobalData).toHaveBeenCalledWith('usd');
    });

    it('should set rate limit headers in the response', async () => {
      mockFetchGlobalData.mockResolvedValue(globalDataMock);

      const req = new Request('http://localhost/api/markets/global?currency=usd');
      const response = await GET(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('59');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should return 304 if ETag matches If-None-Match header', async () => {
      mockFetchGlobalData.mockResolvedValue(globalDataMock);

      const req1 = new Request('http://localhost/api/markets/global?currency=usd');
      const res1 = await GET(req1);
      const etag = res1.headers.get('ETag');

      const req2 = new Request('http://localhost/api/markets/global?currency=usd', {
        headers: { 'if-none-match': etag! },
      });
      const res2 = await GET(req2);

      expect(res2.status).toBe(304);
    });
  });

  describe('Guards', () => {
    it('should return rate limit response if checkRateLimit fails', async () => {
      const mockResponse = new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
      });
      mockCheckRateLimit.mockResolvedValue({
        success: false,
        response: mockResponse,
      });

      const req = new Request('http://localhost/api/markets/global?currency=usd');
      const response = await GET(req);

      expect(response.status).toBe(429);
      expect(mockFetchGlobalData).not.toHaveBeenCalled();
    });

    it('should return validation error response if validateGlobalParams fails', async () => {
      const mockResponse = new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
      });
      mockValidateGlobalParams.mockResolvedValue({
        success: false,
        response: mockResponse,
      });

      const req = new Request('http://localhost/api/markets/global?currency=invalid');
      const response = await GET(req);

      expect(response.status).toBe(400);
      expect(mockFetchGlobalData).not.toHaveBeenCalled();
    });
  });

  describe('Server Errors (500)', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should return 500 when fetchGlobalData throws an error', async () => {
      (process.env as any).NODE_ENV = 'production';
      mockFetchGlobalData.mockRejectedValue(new Error('CoinGecko Error'));

      const req = new Request('http://localhost/api/markets/global?currency=usd');
      const response = await GET(req);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal Server Error');
      expect(data.message).toBe('An internal server error occurred. Please try again later.');
    });
  });
});
