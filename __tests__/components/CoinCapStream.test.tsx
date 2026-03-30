import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReduxProvider } from '@/store/ReduxProvider';
import { CoinCapStream } from '@/components/CoinCapStream';
import { useCoinData } from '@/hooks/useCoinData';
import { CoinDetailFrontMock } from '@/mocks/data/marketDataMock';
import { notFound } from 'next/navigation';
import { Server, WebSocket as MockWebSocket } from 'mock-socket';
import { store } from '@/store/store';
import { setCurrency } from '@/store/uiSlice';
import { Provider } from 'react-redux';

jest.mock('@/hooks/useCoinData');

jest.mock('@/components/Chart', () => ({
  Chart: ({ chartData, ariaLabel }: any) => (
    <div
      data-testid="mock-chart"
      data-aria-label={ariaLabel}
      data-points={chartData?.length}
      data-last-price={chartData?.[chartData.length - 1]?.price}
    >
      {ariaLabel}
    </div>
  ),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock global WebSocket with mock-socket implementation
(global as any).WebSocket = MockWebSocket;

const COINID = 'bitcoin';
const renderCoinCapStream = () => {
  return render(
    <Provider store={store}>
      <CoinCapStream coinId={COINID} />
    </Provider>,
  );
};

const mockUseCoinData = useCoinData as jest.MockedFunction<typeof useCoinData>;
const mockNotFound = notFound;

describe('CoinCapStream Component', () => {
  let mockServer: Server;
  const wsUrl = `wss://ws.coincap.io/prices?assets=${COINID}`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = new Server(wsUrl);

    mockUseCoinData.mockReturnValue({
      data: CoinDetailFrontMock,
      isLoading: false,
      isFetching: false,
    } as any);
  });

  afterEach(() => {
    mockServer.close();
  });

  it('should handle loading state correctly', () => {
    mockUseCoinData.mockReturnValue({
      data: CoinDetailFrontMock,
      isLoading: true,
      isFetching: false,
    } as any);

    renderCoinCapStream();
    expect(screen.getByText(/Loading coin data/i)).toBeInTheDocument();
  });

  it('should call notFound() for error state', () => {
    mockUseCoinData.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: '404 not found' },
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    renderCoinCapStream();
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('should display "Failed to load coin data" and make Retry button functional', () => {
    const refetchMock = jest.fn();

    mockUseCoinData.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: 'Database failure' },
      isFetching: false,
      refetch: refetchMock,
    } as any);

    renderCoinCapStream();
    expect(screen.getByText(/Failed to load coin data/i)).toBeInTheDocument();
    expect(screen.getByText(/Database failure/i)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryButton);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('should correctly display and format data from useCoinData hook', () => {
    renderCoinCapStream();

    const priceHeading = screen.getByRole('heading', { level: 2 });
    expect(priceHeading).toHaveTextContent(/50.*000/i);

    expect(screen.getByText(/▲/i)).toBeInTheDocument();
    expect(screen.getByText(/2.5%/i)).toBeInTheDocument();

    expect(screen.getByText('Market Cap Rank')).toBeInTheDocument();
    expect(screen.getByText(/#1/i)).toBeInTheDocument();

    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText(/1.*000.*000.*000/)).toBeInTheDocument();

    expect(screen.getByText('24h Trading Vol')).toBeInTheDocument();
    expect(screen.getByText(/50.*000.*000/)).toBeInTheDocument();

    expect(screen.getByText('24h High')).toBeInTheDocument();
    expect(screen.getByText(/51.*000/)).toBeInTheDocument();

    expect(screen.getByText('24h Low')).toBeInTheDocument();
    expect(screen.getByText(/49.*000/)).toBeInTheDocument();

    expect(screen.getByText('Circulating Supply')).toBeInTheDocument();
    expect(screen.getByText(/19.*000.*000/)).toBeInTheDocument();

    expect(screen.getByText('All-Time High')).toBeInTheDocument();
    expect(screen.getByText(/69.*000/)).toBeInTheDocument();

    expect(screen.getByText('From ATH')).toBeInTheDocument();
    expect(screen.getByText(/-27.5%/i)).toBeInTheDocument();
  });

  it('should change color and icon based on price trend (positive/negative)', () => {
    mockUseCoinData.mockReturnValue({
      data: {
        ...CoinDetailFrontMock,
        stats: { ...CoinDetailFrontMock.stats, change24h: 2.5 },
      },
      isLoading: false,
    } as any);

    const { rerender } = renderCoinCapStream();

    const positiveTrend = screen.getByText(/2.5%/i);
    expect(positiveTrend).toHaveClass('text-emerald-400');
    expect(screen.getByText(/▲/i)).toBeInTheDocument();

    mockUseCoinData.mockReturnValue({
      data: {
        ...CoinDetailFrontMock,
        stats: { ...CoinDetailFrontMock.stats, change24h: -5.5 },
      },
      isLoading: false,
    } as any);

    rerender(
      <ReduxProvider>
        <CoinCapStream coinId={COINID} />
      </ReduxProvider>,
    );

    const negativeTrend = screen.getByText(/5.5%/i);
    expect(negativeTrend).toHaveClass('text-rose-400');
    expect(screen.getByText(/▼/i)).toBeInTheDocument();
  });

  it('should initiate connection with correct WebSocket URL', async () => {
    let hasConnected = false;
    mockServer.on('connection', () => {
      hasConnected = true;
    });

    renderCoinCapStream();

    await waitFor(() => {
      expect(hasConnected).toBe(true);
    });
  });

  it('should update price upon receiving WebSocket message', async () => {
    mockServer.on('connection', (socket) => {
      socket.send(JSON.stringify({ [COINID]: '60000' }));
    });

    renderCoinCapStream();

    const priceHeading = screen.getByRole('heading', { level: 2 });
    await waitFor(() => {
      expect(priceHeading).toHaveTextContent(/60.*000/);
    });
  });

  it('should add a new point to live chart every second', async () => {
    jest.useFakeTimers();
    let socketRef: any;

    mockServer.on('connection', (socket) => {
      socketRef = socket;
      socket.send(JSON.stringify({ [COINID]: '60000' }));
    });

    renderCoinCapStream();

    await waitFor(() => {
      expect(socketRef).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const liveChart = screen
      .getAllByTestId('mock-chart')
      .find((el) => el.getAttribute('data-aria-label')?.includes('Live')) as HTMLElement;

    expect(liveChart).toBeDefined();
    parseInt(liveChart.getAttribute('data-points') || '0');

    act(() => {
      socketRef.send(JSON.stringify({ [COINID]: '61000' }));
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(parseInt(liveChart.getAttribute('data-points') || '0')).toBeGreaterThan(0);
    expect(liveChart.getAttribute('data-last-price')).toBe('61000');

    // restore timer
    jest.useRealTimers();
  });

  it('should correctly clear interval and WebSocket connection on unmount', async () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const wsCloseSpy = jest.spyOn(MockWebSocket.prototype, 'close');

    const { unmount } = renderCoinCapStream();

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(wsCloseSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
    wsCloseSpy.mockRestore();
  });

  it('should change day range button styling when clicked', async () => {
    renderCoinCapStream();

    const sevenDaysButton = screen.getByRole('button', { name: /7d/i });
    const oneDayButton = screen.getByRole('button', { name: /24h/i });

    // Initially 24h should be selected
    expect(oneDayButton).toHaveClass('bg-gray-700');

    fireEvent.click(sevenDaysButton);

    await waitFor(() => {
      expect(sevenDaysButton).toHaveClass('bg-gray-700');
    });
  });

  it('should react to currency change in Redux', async () => {
    await act(async () => {
      store.dispatch(setCurrency({ code: 'usd', exchangeRate: 1.0 }));
    });

    mockUseCoinData.mockReturnValue({
      data: CoinDetailFrontMock,
      isLoading: false,
    } as any);

    renderCoinCapStream();

    expect(screen.getByText(/Currency \(usd\)/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/\$/);

    mockUseCoinData.mockReturnValue({
      data: {
        ...CoinDetailFrontMock,
        stats: { ...CoinDetailFrontMock.stats, price: 45000 },
      },
      isLoading: false,
    } as any);

    await act(async () => {
      store.dispatch(setCurrency({ code: 'eur', exchangeRate: 0.9 }));
    });

    expect(screen.getByText(/Currency \(eur\)/i)).toBeInTheDocument();

    const priceHeading = screen.getByRole('heading', { level: 2 });
    expect(priceHeading).toHaveTextContent(/45.*000/);
    expect(priceHeading).toHaveTextContent(/€/);

    await act(async () => {
      store.dispatch(setCurrency({ code: 'usd', exchangeRate: 1.0 }));
    });
  });
});
