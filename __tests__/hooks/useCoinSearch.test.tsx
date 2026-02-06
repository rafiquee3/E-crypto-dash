import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';
import QueryProvider from '@/providers/QueryProvider';
import { useCoinSearch } from '@/hooks/useCoinSearch';
import { mockSearchResults } from '@/mocks/data/globalDataMock';

const QUERY = 'bitcoin';

describe('useCoinSearch Hook', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/search', () => {
        return HttpResponse.json(mockSearchResults);
      }),
    );
  });

  describe('Success States', () => {
    it('should return search data when the request is successful', async () => {
      const { result } = renderHook(() => useCoinSearch(QUERY), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toStrictEqual(mockSearchResults);
    });

    it('should transition correctly through loading and success states', async () => {
      const { result } = renderHook(() => useCoinSearch(QUERY), {
        wrapper: QueryProvider,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isLoading).toBe(false);
    });

    it('should return an empty array when the query is one character long', async () => {
      const { result } = renderHook(() => useCoinSearch('b'), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.data).toStrictEqual({ coins: [] }));
    });

    it('should call fetch with the correct URL parameters', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get('/api/search', ({ request }) => {
          capturedRequest = request;
          return HttpResponse.json(mockSearchResults);
        }),
      );

      const { result } = renderHook(() => useCoinSearch(QUERY), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('query')).toBe(QUERY);
    });
  });

  describe('Error Handling', () => {
    it('should handle API server errors (500)', async () => {
      server.use(
        http.get('/api/search', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useCoinSearch(QUERY), {
        wrapper: QueryProvider,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/search', () => {
          return HttpResponse.error();
        }),
      );

      const { result } = renderHook(() => useCoinSearch(QUERY), { wrapper: QueryProvider });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('Caching Behavior', () => {
    it('should use cached data on subsequent renders', async () => {
      let fetchCount = 0;

      server.use(
        http.get('/api/search', () => {
          fetchCount++;
          return HttpResponse.json(mockSearchResults);
        }),
      );

      // First render
      const { result, rerender } = renderHook(() => useCoinSearch(QUERY), {
        wrapper: QueryProvider,
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(fetchCount).toBe(1);

      rerender();

      expect(result.current.data).toStrictEqual(mockSearchResults);
      expect(fetchCount).toBe(1);
    });
  });
});
