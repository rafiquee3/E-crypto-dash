import { GET } from '@/app/api/coin/route';
import { CoinGeckoAdapter } from '@/adapters/adapters/CoinGeckoAdapter';
import { checkRateLimit } from '@/guards/rateLimitGuard';
import { validateDetailParams } from '@/guards/validationGuard';
import { coinDetailMock } from '@/mocks/data/marketDataMock';

jest.mock('@/adapters/adapters/CoinGeckoAdapter');
jest.mock('@/guards/rateLimitGuard', () => ({
  checkRateLimit: jest.fn(),
}));
jest.mock('@/guards/validationGuard', () => ({
  validateDetailParams: jest.fn(),
}));
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}));

const mockCheckRateLimit = checkRateLimit as jest.Mock;
const mockValidateDetailParams = validateDetailParams as jest.Mock;
const mockFetchCoinData = jest.fn();

describe('api/coin route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (CoinGeckoAdapter as jest.Mock).mockImplementation(() => ({
      fetchCoinData: mockFetchCoinData,
    }));

    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });

    mockValidateDetailParams.mockResolvedValue({
      success: true,
      data: { currency: 'usd', coinId: 'bitcoin', days: '1' },
    });
  });

  describe('Success (200)', () => {
    it('should return coin data when parameters are valid', async () => {
      mockFetchCoinData.mockResolvedValue(coinDetailMock);

      const req = new Request('http://localhost/api/coin?currency=usd&coinId=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toStrictEqual(coinDetailMock);
      expect(mockFetchCoinData).toHaveBeenCalledWith('usd', 'bitcoin');
    });

    it('should set rate limit headers in the response', async () => {
      mockFetchCoinData.mockResolvedValue(coinDetailMock);

      const req = new Request('http://localhost/api/coin?currency=usd&coinId=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('59');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should return 304 if ETag matches If-None-Match header', async () => {
      mockFetchCoinData.mockResolvedValue(coinDetailMock);

      const req1 = new Request('http://localhost/api/coin?currency=usd&coinId=bitcoin');
      const res1 = await GET(req1);
      const etag = res1.headers.get('ETag');

      const req2 = new Request('http://localhost/api/coin?currency=usd&coinId=bitcoin', {
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

      const req = new Request('http://localhost/api/coin?currency=usd&coinId=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(429);
      expect(mockFetchCoinData).not.toHaveBeenCalled();
    });

    it('should return validation error response if validateDetailParams fails', async () => {
      const mockResponse = new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 404,
      });
      mockValidateDetailParams.mockResolvedValue({
        success: false,
        response: mockResponse,
      });

      const req = new Request('http://localhost/api/coin?currency=usd&coinId=invalid');
      const response = await GET(req);

      expect(response.status).toBe(404);
      expect(mockFetchCoinData).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should return 404/500 if adapter throws', async () => {
      (process.env as any).NODE_ENV = 'production';
      mockFetchCoinData.mockRejectedValue(new Error('CoinGecko Error'));

      const req = new Request('http://localhost/api/coin?currency=usd&coinId=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found'); // createErrorResponse(error, 404) in route.ts
    });
  });
});
