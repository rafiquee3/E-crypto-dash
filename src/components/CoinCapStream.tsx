'use client';
import { useCoinData } from "@/hooks/useCoinData";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Chart } from "./Chart";

export function CoinCapStream({coinId}: {coinId: string}) {
    const {
        data,
        isLoading,
        isError,
        error,          // object
        isFetching,
        refetch,        // refresh data
        status,
        isSuccess,
    } = useCoinData(coinId);

    const [chartData, setChartData] = useState<{time: number, price: number}[]>([]);
    const currency = useSelector((state: RootState) => state.ui.currency);
    const [price, setPrice] = useState<string | null>(null);
    const lastPriceRef = useRef<number | null>(null);

    useEffect(() => {
        if (!coinId) return;
        if (!data?.stats || !data?.chart) return;

        let ws: WebSocket | null = null;
        let timeoutId: NodeJS.Timeout;

        lastPriceRef.current = data.stats.price;
        setPrice(data.stats.price.toLocaleString(undefined, {
          style: 'currency', currency: currency.code
        }));

        const history = data.chart.map((p: any) => ({ time: p[0], price: p[1] }));
        setChartData([...history].slice(-20));

        const chartInterval = setInterval(() => {
            if (lastPriceRef.current !== null) {
              setChartData((prev) => {
              const newPoint = {time: Date.now(), price: lastPriceRef.current as number};
              return [...prev, newPoint].slice(-20);
              })
            }
        }, 1000);

        const connect = () => {
          ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${coinId}`);
          console.log(`[WS] connection`);
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data[coinId]) {
              const numericPrice = parseFloat(data[coinId]) * currency.exchangeRate;

              lastPriceRef.current = numericPrice;

              setPrice(numericPrice.toLocaleString(undefined, {
                  style: 'currency',
                  currency: currency.code.toUpperCase(),
              }));
              }
          };

          ws.onclose = (e) => {
            console.log(`[WS] connection lost. Code: ${e.code}. Reconnect 3s...`);
            timeoutId = setTimeout(connect, 3000);
          }

          ws.onerror = (err) => {
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
    }, [data]);
    if (isLoading) return <p>Loading...</p>

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="md:col-span-1 space-y-6">
          <div>
              <h2 className="text-4xl font-bold tracking-tight text-white">
                {price || '...'}
              </h2>
              <div className={`text-lg font-medium ${data.stats.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.stats.change24h >= 0 ? '▲' : '▼'}{Math.abs(data.stats.change24h).toFixed(1)}%(24h)
              </div>

            <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-medium">Currency ({currency.code})</p>
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
              <div key={stat.label} className="flex justify-between items-center py-3 border-b border-gray-800/50 group gap-4">
                <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors truncate min-w-0">
                  {stat.label}
                </span>
                <span className={`font-semibold truncate min-w-0 ${
                  stat.isPercentage ? (stat.value < 0 ? 'text-red-500' : 'text-green-500') : 'text-gray-100'
                }`}>
                  {stat.isCurrency && stat.value.toLocaleString(undefined, {
                    style: 'currency',
                    currency: currency.code,
                  })}
                  {stat.isPercentage && `${stat.value.toFixed(1)}%`}
                  {stat.isRank && `#${stat.value}`}
                  {!stat.isCurrency && !stat.isPercentage && !stat.isRank && stat.value.toLocaleString(
                    undefined, {
                    style: 'currency',
                    currency: currency.code,
                  }
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50">
            <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">Live Real-time Feed (1s)</h3>
            <div className="h-[250px] w-full">
              <Chart width={'100%'} height={'100%'} chartData={chartData} currencyCode={currency.code}/>
            </div>
          </div>

          <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/50">
            <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">Historical Context (24h)</h3>
            <div className="h-[250px] w-full">
              <Chart
                width={'100%'}
                height={'100%'}
                chartData={data.chart.map((p: any) => ({ time: p[0], price: p[1] }))}
                currencyCode={currency.code}
              />
            </div>
          </div>
        </div>
      </div>
    );
}
