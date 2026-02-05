import { render, screen, waitFor, act } from '@testing-library/react';
import { server } from '@/mocks/node';
import { delay, http, HttpResponse } from 'msw';
import { marketDataMock } from '@/mocks/data/marketDataMock';
import { AssetList } from '@/components/AssetList';
import QueryProvider from '@/providers/QueryProvider';
import { ReduxProvider } from '@/store/ReduxProvider';
import userEvent from '@testing-library/user-event';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === 'page') return '1';
      if (key === 'perPage') return '10';
      return null;
    }),
    toString: () => '',
  }),
}));

const renderAssetList = () =>
  render(
    <ReduxProvider>
      <QueryProvider>
        <AssetList />
      </QueryProvider>
    </ReduxProvider>,
  );

describe('AssetList', () => {
  it('should render the correct number of items and values from props', async () => {
    server.use(
      http.get('/api/markets', () => {
        return HttpResponse.json(marketDataMock, { status: 200 });
      }),
    );

    renderAssetList();
    const firstCoin = await screen.findByText(marketDataMock[0].name);
    expect(firstCoin).toBeInTheDocument();

    const items = screen.getAllByRole('link', { name: /view details for/i });
    expect(items.length).toBe(marketDataMock.length);

    const coin = marketDataMock[0];
    expect(screen.getByText(coin.name)).toBeInTheDocument();
    expect(screen.getAllByText(/\$/)[0]).toBeInTheDocument();
  });

  it('should handle loading state ("Loading...")', async () => {
    let resolve: any;
    const promise = new Promise((res) => {
      resolve = res;
    });
    server.use(
      http.get('/api/markets', async () => {
        await promise;
        return HttpResponse.json(marketDataMock, { status: 200 });
      }),
    );

    renderAssetList();

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // request deblock
    act(() => resolve());
    await screen.findByText(marketDataMock[0].name);
  });

  it('should handle error state (isError)', async () => {
    server.use(
      http.get('/api/markets', async () => {
        return HttpResponse.error();
      }),
    );

    renderAssetList();
    expect(await screen.findByText(/Failed to load market data/i)).toBeInTheDocument();
  });

  it('should handle empty data state ("No data")', async () => {
    server.use(
      http.get('/api/markets', async () => {
        return HttpResponse.json([], { status: 200 });
      }),
    );

    renderAssetList();
    expect(await screen.findByText(/No assets found/i)).toBeInTheDocument();
  });

  it('should display all important columns/headers with correct formatting', async () => {
    server.use(
      http.get('/api/markets', async () => {
        return HttpResponse.json(marketDataMock, { status: 200 });
      }),
    );

    renderAssetList();
    const headerLabels = ['Rank', 'Coin', 'Price', '1h', '24h', 'Volume', 'M Cap', 'Last 7d'];

    for (const label of headerLabels) {
      expect(await screen.findByText(label)).toBeInTheDocument();
    }

    expect(screen.getAllByText(/\$/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/%/)[0]).toBeInTheDocument();
    // /([MBT])$/ => "1.9T"
    expect(screen.getAllByText(/([MBT])$/, { exact: false })[0]).toBeInTheDocument();
  });

  it('should show fallback "N/A" for missing or invalid data', async () => {
    const brokenAsset = [{ ...marketDataMock[0], current_price: null, market_cap: null }];
    server.use(
      http.get('/api/markets', async () => {
        return HttpResponse.json(brokenAsset, { status: 200 });
      }),
    );

    renderAssetList();
    const elements = await screen.findAllByText('N/A');
    expect(elements[0]).toBeInTheDocument();
  });

  it('should match stable table snapshot', async () => {
    server.use(http.get('/api/markets', () => HttpResponse.json(marketDataMock, { status: 200 })));

    const { container } = renderAssetList();
    await screen.findByText(marketDataMock[0].name);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Pagination', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    mockPush.mockClear();
    server.use(http.get('/api/markets', () => HttpResponse.json(marketDataMock)));
  });

  it('should display page indicator', async () => {
    renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    expect(screen.getByText(/page/i)).toBeInTheDocument();
  });

  it('should have next and previous buttons', async () => {
    renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    expect(screen.getByText(/next/i)).toBeInTheDocument();
    expect(screen.getByText(/prev/i)).toBeInTheDocument();
  });

  it('should disable prev button on first page', async () => {
    renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    const prevButton = screen.getByRole('button', { name: /prev/i });
    expect(prevButton).toBeDisabled();
  });

  it('should allow changing items per page', async () => {
    renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Change to 20 items per page
    await user.selectOptions(select, '20');

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('perPage=20'),
      expect.any(Object),
    );
  });
});

describe('Accessibility', () => {
  beforeEach(() => {
    server.use(http.get('/api/markets', () => HttpResponse.json(marketDataMock)));
  });

  it('should have proper table structure', async () => {
    renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    expect(screen.getByText(/Rank/i)).toBeInTheDocument();
    expect(screen.getByText(marketDataMock[0].name)).toBeInTheDocument();
  });

  it('should have clickable rows for navigation', async () => {
    renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    const link = screen.getByLabelText(
      new RegExp(`View details for ${marketDataMock[0].name}`, 'i'),
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/coin/${marketDataMock[0].id}`);
  });
});

describe('Snapshot Tests', () => {
  it('should match snapshot when data is loaded', async () => {
    server.use(http.get('/api/markets', () => HttpResponse.json(marketDataMock)));

    const { container } = renderAssetList();
    await screen.findByText(marketDataMock[0].name);

    expect(container.firstChild).toMatchSnapshot();
  });
});
