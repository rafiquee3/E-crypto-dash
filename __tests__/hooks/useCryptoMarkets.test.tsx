import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';
import { useCryptoMarkets } from '@/hooks/useCryptoMarkets';
import QueryProvider from '@/providers/QueryProvider';
import { MarketDataFrontMock } from '@/mocks/data/marketDataMock';

describe('useCryptoMarkets Hook', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/markets', () => {
        return HttpResponse.json(MarketDataFrontMock);
      }),
    );
  });

  describe('Success States', () => {
    it('should return market data when the request is successful', async () => {
      const { result } = renderHook(() => useCryptoMarkets(), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toStrictEqual(MarketDataFrontMock);
    });

    it('should transition correctly through loading and success states', async () => {
      const { result } = renderHook(() => useCryptoMarkets(), {
        wrapper: QueryProvider,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle numeric strings in options by casting them via Yup', async () => {
      const { result } = renderHook(() => useCryptoMarkets({ per_page: '15' }), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toStrictEqual(MarketDataFrontMock);
    });

    it('should call fetch with the correct URL parameters', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get('/api/markets', ({ request }) => {
          capturedRequest = request;
          return HttpResponse.json(MarketDataFrontMock);
        }),
      );

      const options = { vs_currency: 'eur', per_page: 50 };
      const { result } = renderHook(() => useCryptoMarkets(options), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('vs_currency')).toBe('eur');
      expect(url.searchParams.get('per_page')).toBe('50');
      expect(url.searchParams.get('order')).toBe('market_cap_desc');
    });
  });

  describe('Error Handling', () => {
    it('should handle API server errors (500)', async () => {
      server.use(
        http.get('/api/markets', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useCryptoMarkets(), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/markets', () => {
          return HttpResponse.error();
        }),
      );

      const { result } = renderHook(() => useCryptoMarkets(), { wrapper: QueryProvider });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('Caching Behavior', () => {
    it('should use cached data on subsequent renders', async () => {
      let fetchCount = 0;

      server.use(
        http.get('/api/markets', () => {
          fetchCount++;
          return HttpResponse.json(MarketDataFrontMock);
        }),
      );

      // First render
      const { result, rerender } = renderHook(() => useCryptoMarkets(), { wrapper: QueryProvider });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(fetchCount).toBe(1);

      rerender();

      expect(result.current.data).toStrictEqual(MarketDataFrontMock);
      expect(fetchCount).toBe(1);
    });
  });
});
