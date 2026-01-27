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
      <div>
        <div className={`text-[15px] ${data.stats.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{data.stats.change24h >= 0 ? '▲' : '▼'}{Math.abs(data.stats.change24h).toFixed(1)}% (24h)</div>
        <p>price: {price || 'loading data...'}</p>
        <p>currency: {currency.code}</p>
        <div className="h-[200px] w-full mt-4">
          <Chart width={'50%'} height={'100%'} chartData={chartData} currencyCode={currency.code}/>
        </div>
          <div className="h-[200px] w-full mt-4">
          <Chart width={'50%'} height={'100%'} chartData={data.chart.map((p: any) => ({ time: p[0], price: p[1] }))} currencyCode={currency.code}/>
        </div>
      </div>
    );
}

/*   const data = {
      stats: {
        price: marketData.market_data.current_price[currency],
        marketCap: marketData.market_data.market_cap[currency],
        volume: marketData.market_data.total_volume[currency],
        supply: marketData.market_data.circulating_supply,
        change24h:
      },
      chart: chartData.prices
    }; */

    // const trend24h = marketData.market_data.price_change_percentage_24h;
