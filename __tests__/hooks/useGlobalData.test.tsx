import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';
import QueryProvider from '@/providers/QueryProvider';
import { globalDataMock } from '@/mocks/data/marketDataMock';
import { useGlobalData } from '@/hooks/useGlobalData';
import { ReduxProvider } from '@/store/ReduxProvider';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <ReduxProvider>
    <QueryProvider>{children}</QueryProvider>
  </ReduxProvider>
);

describe('useGlobalData Hook', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/markets/global', () => {
        return HttpResponse.json(globalDataMock);
      }),
    );
  });

  describe('Success States', () => {
    it('should return global data when the request is successful', async () => {
      const { result } = renderHook(() => useGlobalData(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toStrictEqual(globalDataMock);
    });

    it('should call fetch with the correct URL parameters', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get('/api/markets/global', ({ request }) => {
          capturedRequest = request;
          return HttpResponse.json(globalDataMock);
        }),
      );

      const { result } = renderHook(() => useGlobalData(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('currency')).toBeDefined();
    });

    it('should transition correctly through loading and success states', async () => {
      const { result } = renderHook(() => useGlobalData(), {
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
        http.get('/api/markets/global', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useGlobalData(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/markets/global', () => {
          return HttpResponse.error();
        }),
      );

      const { result } = renderHook(() => useGlobalData(), { wrapper: AllTheProviders });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('Caching Behavior', () => {
    it('should use cached data on subsequent renders', async () => {
      let fetchCount = 0;

      server.use(
        http.get('/api/markets/global', () => {
          fetchCount++;
          return HttpResponse.json(globalDataMock);
        }),
      );

      // First render
      const { result, rerender } = renderHook(() => useGlobalData(), { wrapper: AllTheProviders });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(fetchCount).toBe(1);

      rerender();

      expect(result.current.data).toStrictEqual(globalDataMock);
      expect(fetchCount).toBe(1);
    });
  });
});
