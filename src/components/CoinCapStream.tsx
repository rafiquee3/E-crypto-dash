'use client';
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function CoinCapStream({coinId, initialPrice}: {coinId: string, initialPrice?: string}) {
    const [price, setPrice] = useState<string | null>(() => {
      if (initialPrice) {
          return parseFloat(initialPrice).toLocaleString(undefined, {
                style: 'currency', currency: 'USD'
            });
        }
        return null;
    });

    const [chartData, setChartData] = useState<{time: number, price: number}[]>([]);
    const currency = useSelector((state: RootState) => state.ui.currency);
    const lastPriceRef = useRef<number | null>(null);

    useEffect(() => {
        if (!coinId) return;
        let ws: WebSocket | null = null;
        let timeoutId: NodeJS.Timeout;

        if (initialPrice && lastPriceRef.current === null) {
          lastPriceRef.current = parseFloat(initialPrice);
          setChartData([{time: Date.now(), price: lastPriceRef.current as number}]);
        }

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
              const numericPrice = parseFloat(data[coinId]);

              lastPriceRef.current = numericPrice;

              setPrice(numericPrice.toLocaleString(undefined, {
                  style: 'currency',
                  currency: currency.toUpperCase(),
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
    }, [coinId]);
    console.log('chart:', chartData);
    return (
      <div>
        <p>price: {price || 'loading data...'}</p>
        <p>currency: {currency}</p>
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="time" hide={true} />
                  <YAxis domain={['auto', 'auto']} hide={true} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    isAnimationActive={false}
                  />
              </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )

}
