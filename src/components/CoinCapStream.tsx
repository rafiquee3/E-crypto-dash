'use client';
import { useCoinData } from '@/hooks/useCoinData';
import { RootState } from '@/store/store';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Chart } from './Chart';
import { toggleAlert } from '@/store/uiSlice';
import { notFound } from 'next/navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { PriceAlerts } from './PriceAlerts';

export function CoinCapStream({ coinId }: { coinId: string }) {
  const [days, setDays] = useState<string>('1');
  const {
    data,
    isLoading,
    isError,
    error, // object
    isFetching,
    refetch, // refresh data
    status,
    isSuccess,
  } = useCoinData(coinId);

  const [chartData, setChartData] = useState<{ time: number; price: number }[]>([]);
  const currency = useSelector((state: RootState) => state.ui.currency);
  const [price, setPrice] = useState<string | null>(null);
  const lastPriceRef = useRef<number | null>(null);

  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) => state.ui.alerts || []);
  const alertsRef = useRef(alerts);

  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const timeRanges = [
    { label: '24h', value: '1' },
    { label: '7d', value: '7' },
    { label: '1M', value: '30' },
    { label: '3M', value: '90' },
    { label: '1A', value: '365' },
  ];

  useEffect(() => {
    if (!coinId) return;
    if (!data?.stats || !data?.chart || !data.chart[days as keyof typeof data.chart]) return;

    let ws: WebSocket | null = null;
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;

    lastPriceRef.current = data.stats.price;
    setPrice(
      data.stats.price.toLocaleString(undefined, {
        style: 'currency',
        currency: currency.code,
      }),
    );

    const currentChart = data.chart[days as keyof typeof data.chart] || [];
    const history = currentChart.map((p: any) => ({ time: p[0], price: p[1] }));
    setChartData([...history].slice(-20));

    const chartInterval = setInterval(() => {
      if (lastPriceRef.current !== null) {
        setChartData((prev) => {
          const newPoint = { time: Date.now(), price: lastPriceRef.current as number };
          return [...prev, newPoint].slice(-20);
        });
      }
    }, 1000);

    const connect = () => {
      ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${coinId}`);

      ws.onopen = () => {
        console.log(`[WS] connected to ${coinId}`);
        retryCount = 0; // Reset retries on successful connection
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data[coinId]) {
          const numericPrice = parseFloat(data[coinId]) * currency.exchangeRate;

          lastPriceRef.current = numericPrice;

          // Check alerts
          alertsRef.current.forEach((alert) => {
            if (alert.active && alert.coinId === coinId && alert.currency === currency.code) {
              const isHit =
                alert.condition === 'above'
                  ? numericPrice >= alert.targetPrice
                  : numericPrice <= alert.targetPrice;

              if (isHit) {
                if (Notification.permission === 'granted') {
                  new Notification(`Price Alert: ${coinId.toUpperCase()}`, {
                    body: `${coinId} is now ${alert.condition} ${alert.targetPrice} ${currency.code.toUpperCase()}`,
                    icon: '/favicon.ico',
                  });
                }
                dispatch(toggleAlert(alert.id));
              }
            }
          });

          setPrice(
            numericPrice.toLocaleString(undefined, {
              style: 'currency',
              currency: currency.code.toUpperCase(),
            }),
          );
        }
      };

      ws.onclose = (e) => {
        if (e.wasClean) return;

        // Exponential Backoff: delay = 1s, 2s, 4s, 8s... up to 30s
        // Added Jitter: +- 0-1000ms to prevent thundering herd
        const baseDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;

        console.log(
          `[WS] connection lost. Code: ${e.code}. Reconnect in ${Math.round(delay)}ms... (Attempt ${retryCount + 1})`,
        );

        timeoutId = setTimeout(() => {
          retryCount++;
          connect();
        }, delay);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(chartInterval);

      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [coinId, currency.exchangeRate, data?.chart]);

  const historicalChartData = useMemo(() => {
    if (!data?.chart || !data.chart[days as keyof typeof data.chart]) return [];
    const currentChart = data.chart[days as keyof typeof data.chart];
    return currentChart.map((p: any) => ({ time: p[0], price: p[1] }));
  }, [data?.chart, days]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 font-medium">Loading coin data...</div>
      </div>
    );
  }

  if (isError) {
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = String(error.message).toLowerCase();
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        notFound();
      }
    }

    return (
      <div className="p-8 bg-red-900/10 border border-red-900/20 rounded-xl text-center">
        <p className="text-red-400 mb-4 font-medium">Failed to load coin data</p>
        <p className="text-gray-500 text-sm mb-4">{error?.message || 'Unknown error'}</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-300 rounded-lg transition-colors border border-red-900/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.stats || !data.chart || !data.chart[days as keyof typeof data.chart]) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h2
              className="text-4xl font-bold tracking-tight text-white focus:outline-none"
              aria-live="polite"
            >
              {price || '...'}
            </h2>
            {data?.stats?.price && <PriceAlerts coinId={coinId} currentPrice={data.stats.price} />}
          </div>
          <div
            className={`text-lg font-medium ${data.stats.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            <span aria-hidden="true">{data.stats.change24h >= 0 ? '▲' : '▼'}</span>
            {Math.abs(data.stats.change24h).toFixed(1)}%(24h)
          </div>

          <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-medium">
            Currency ({currency.code})
          </p>
        </div>

        <div className="space-y-1 border-t border-gray-800 pt-6">
          {[
            { label: 'Market Cap Rank', value: data.stats.rank, isRank: true },
            { label: 'Market Cap', value: data.stats.marketCap, isCurrency: true },
            { label: '24h Trading Vol', value: data.stats.volume, isCurrency: true },
            { label: '24h High', value: data.stats.high24h, isCurrency: true },
            { label: '24h Low', value: data.stats.low24h, isCurrency: true },
            { label: 'Circulating Supply', value: data.stats.supply, isCurrency: false },
            { label: 'All-Time High', value: data.stats.ath, isCurrency: true },
            { label: 'From ATH', value: data.stats.athChange, isPercentage: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex justify-between items-center py-3 border-b border-gray-800/50 group gap-4"
            >
              <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors truncate min-w-0">
                {stat.label}
              </span>
              <span
                className={`font-semibold truncate min-w-0 ${
                  stat.isPercentage
                    ? stat.value < 0
                      ? 'text-red-500'
                      : 'text-green-500'
                    : 'text-gray-100'
                }`}
              >
                {stat.isCurrency &&
                  stat.value?.toLocaleString(undefined, {
                    style: 'currency',
                    currency: currency.code,
                  })}
                {stat.isPercentage && stat.value !== undefined && `${stat.value?.toFixed(1)}%`}
                {stat.isRank && stat.value !== undefined && `#${stat.value}`}
                {!stat.isCurrency &&
                  !stat.isPercentage &&
                  !stat.isRank &&
                  stat.value?.toLocaleString(undefined, {
                    style: 'currency',
                    currency: currency.code,
                  })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 space-y-8">
        <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50">
          <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">
            Live Real-time Feed (1s)
          </h3>
          <div className="w-full min-h-[150px] min-w-[150px]">
            <ErrorBoundary fallback={<p>Live chart display issue.</p>}>
              <Chart
                chartData={chartData}
                currencyCode={currency.code}
                ariaLabel={`Live real-time price feed for ${coinId}`}
              />
            </ErrorBoundary>
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Historical Context ({timeRanges.find((tr) => tr.value === days)?.label})
            </h3>
            <div className="flex bg-gray-800/50 rounded-lg p-1 gap-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDays(range.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    days === range.value
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`w-full min-h-[150px] min-w-[150px] transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}
          >
            <ErrorBoundary fallback={<p>Chart display issue.</p>}>
              <Chart
                chartData={historicalChartData}
                currencyCode={currency.code}
                days={parseInt(days)}
                ariaLabel={`Historical ${timeRanges.find((tr) => tr.value === days)?.label} price chart for ${coinId}`}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
