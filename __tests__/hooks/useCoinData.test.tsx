import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';
import QueryProvider from '@/providers/QueryProvider';
import { coinDetailMock } from '@/mocks/data/marketDataMock';
import { ReduxProvider } from '@/store/ReduxProvider';
import { useCoinData } from '@/hooks/useCoinData';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <ReduxProvider>
    <QueryProvider>{children}</QueryProvider>
  </ReduxProvider>
);

const COINID = 'bitcoin';

describe('useCoinData Hook', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/coin', () => {
        return HttpResponse.json(coinDetailMock);
      }),
    );
  });

  describe('Success States', () => {
    it('should return coin data when the request is successful', async () => {
      const { result } = renderHook(() => useCoinData(COINID), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toStrictEqual(coinDetailMock);
    });

    it('should call fetch with the correct URL parameters', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get('/api/coin', ({ request }) => {
          capturedRequest = request;
          return HttpResponse.json(coinDetailMock);
        }),
      );

      const { result } = renderHook(() => useCoinData(COINID), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('coinId')).toBe(COINID);
      expect(url.searchParams.get('currency')).toBeDefined();
    });

    it('should transition correctly through loading and success states', async () => {
      const { result } = renderHook(() => useCoinData(COINID), {
        wrapper: AllTheProviders,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API server errors (500)', async () => {
      server.use(
        http.get('/api/coin', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useCoinData(COINID), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/coin', () => {
          return HttpResponse.error();
        }),
      );

      const { result } = renderHook(() => useCoinData(COINID), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('Caching Behavior', () => {
    it('should use cached data on subsequent renders', async () => {
      let fetchCount = 0;

      server.use(
        http.get('/api/coin', () => {
          fetchCount++;
          return HttpResponse.json(coinDetailMock);
        }),
      );

      const { result, rerender } = renderHook(() => useCoinData(COINID), {
        wrapper: AllTheProviders,
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(fetchCount).toBe(1);

      rerender();

      expect(result.current.data).toStrictEqual(coinDetailMock);
      expect(fetchCount).toBe(1);
    });
  });
});
