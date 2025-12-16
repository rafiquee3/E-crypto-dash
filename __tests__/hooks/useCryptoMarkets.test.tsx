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
            })
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
    });

    describe('Error Handling', () => {
        it('should enter error state when invalid parameters are provided', async () => {

            const { result } = renderHook(() => useCryptoMarkets({ per_page: 9999 }), {
                wrapper: QueryProvider,
            });

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toContain('Validation failed');
        });

        it('should handle API server errors (500)', async () => {
            server.use(
                http.get('/api/markets', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const { result } = renderHook(() => useCryptoMarkets(), {
                wrapper: QueryProvider,
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
        });
    });
});
