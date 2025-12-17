import { render, screen, waitFor, act } from '@testing-library/react';
import { server } from '@/mocks/node';
import { delay, http, HttpResponse } from 'msw';
import { marketDataMock } from '@/mocks/data/marketDataMock';
import { AssetList } from '@/components/AssetList';
import QueryProvider from '@/providers/QueryProvider';
import { ReduxProvider } from '@/store/ReduxProvider';

const renderAssetList = () =>
    render(
      <ReduxProvider>
        <QueryProvider>
          <AssetList />
        </QueryProvider>
      </ReduxProvider>
    );

describe('AssetList', () => {
    it('should render the correct number of items and values from props', async () => {
        server.use(
            http.get('/api/markets',  () => { 
                return HttpResponse.json(marketDataMock, { status: 200 });
            })
        );

        renderAssetList();
        const firstCoin = await screen.findByText(marketDataMock[0].name);
        expect(firstCoin).toBeInTheDocument();

        const items = screen.getAllByRole('row');
        expect(items.length - 1).toBe(marketDataMock.length);

        const coin = marketDataMock[0];
        expect(screen.getByText(coin.name)).toBeInTheDocument();
        expect(screen.getAllByText(/\$/)[0]).toBeInTheDocument();
    });

    it('should handle loading state ("Loading...")', async () => {
        let resolve: any;
        const promise = new Promise(res => { resolve = res; });
        server.use(
            http.get('/api/markets',  async () => { 
                await promise;
                return HttpResponse.json(marketDataMock, { status: 200 });
            })
        );

        renderAssetList();

        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

        // request deblock
        act(() => resolve());
        await screen.findByText(marketDataMock[0].name);
    });

    it('should handle error state (isError)', async () => {
        server.use(
            http.get('/api/markets',  async () => { 
                return HttpResponse.error();
            })
        );

        renderAssetList();
        expect(await screen.findByText(/Error loading assets/i)).toBeInTheDocument();
    });

    it('should handle empty data state ("No data")', async () => {
        server.use(
            http.get('/api/markets',  async () => { 
                return HttpResponse.json([], { status: 200 });
            })
        );

        renderAssetList();
        expect(await screen.findByText(/No data/i)).toBeInTheDocument();
    });

    it('should display all important columns/headers with correct formatting', async () => {
        server.use(
            http.get('/api/markets',  async () => { 
                return HttpResponse.json(marketDataMock, { status: 200 });
            })
        );

        renderAssetList();
        const headerLabels = [
            '#', 'Coin', 'Price', '1h', '24h', 'Volume', 'Market Cap', 'Last 7 Days'
        ];

        for (const label of headerLabels) {
            expect(await screen.findByText(label)).toBeInTheDocument();
        };

        expect(screen.getAllByText(/\$/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/%/)[0]).toBeInTheDocument();
        // /([MBT])$/ => "1.9T"
        expect(screen.getAllByText(/([MBT])$/, { exact: false })[0]).toBeInTheDocument();
    });

    it('should show fallback "N/A" for missing or invalid data', async () => {
        const brokenAsset = [{ ...marketDataMock[0], current_price: null, market_cap: null }];
        server.use(
            http.get('/api/markets',  async () => { 
                return HttpResponse.json(brokenAsset, { status: 200 });
            })
        );

        renderAssetList();
        const elements = await screen.findAllByText('N/A');
        expect(elements[0]).toBeInTheDocument();
    });

    it('should match stable table snapshot', async () => {
        server.use(
            http.get('/api/markets', () =>
              HttpResponse.json(marketDataMock, { status: 200 })
            )
        );

        const { container } = renderAssetList();
        await screen.findByText(marketDataMock[0].name);
        expect(container.querySelector('table')).toMatchSnapshot();
    });
});
