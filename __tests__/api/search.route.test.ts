import { GET } from '@/app/api/search/route';
import { CoinGeckoAdapter } from '@/adapters/adapters/CoinGeckoAdapter';
import { checkRateLimit } from '@/guards/rateLimitGuard';
import { validateSearchParams } from '@/guards/validationGuard';
import { mockSearchResults } from '@/mocks/data/globalDataMock';

// Mock dependencies with factories to prevent loading original files
jest.mock('@/adapters/adapters/CoinGeckoAdapter');
jest.mock('@/guards/rateLimitGuard', () => ({
  checkRateLimit: jest.fn(),
}));
jest.mock('@/guards/validationGuard', () => ({
  validateSearchParams: jest.fn(),
}));

// We don't need to mock NextResponse if we don't use internal details,
// but let's keep it simple as the route handles it.

const mockCheckRateLimit = checkRateLimit as jest.Mock;
const mockValidateSearchParams = validateSearchParams as jest.Mock;
const mockSearch = jest.fn();

describe('api/search route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CoinGeckoAdapter instance
    (CoinGeckoAdapter as jest.Mock).mockImplementation(() => ({
      search: mockSearch,
    }));

    // Default successful rate limit
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });

    // Default successful validation
    mockValidateSearchParams.mockResolvedValue({
      success: true,
      data: { query: 'bitcoin' },
    });
  });

  describe('Success (200)', () => {
    it('should return search results when query is valid', async () => {
      mockSearch.mockResolvedValue(mockSearchResults);

      const req = new Request('http://localhost/api/search?query=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toStrictEqual(mockSearchResults);
      expect(mockSearch).toHaveBeenCalledWith('bitcoin');
    });

    it('should set rate limit headers in the response', async () => {
      mockSearch.mockResolvedValue(mockSearchResults);

      const req = new Request('http://localhost/api/search?query=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('59');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
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

      const req = new Request('http://localhost/api/search?query=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(429);
      expect(mockSearch).not.toHaveBeenCalled();
    });

    it('should return validation error response if validateSearchParams fails', async () => {
      const mockResponse = new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
      });
      mockValidateSearchParams.mockResolvedValue({
        success: false,
        response: mockResponse,
      });

      const req = new Request('http://localhost/api/search?query=b');
      const response = await GET(req);

      expect(response.status).toBe(400);
      expect(mockSearch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 error if adapter throws', async () => {
      mockSearch.mockRejectedValue(new Error('CoinGecko Error'));

      const req = new Request('http://localhost/api/search?query=bitcoin');
      const response = await GET(req);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal Server Error');
    });
  });
});
