'use client';
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function CoinCapStream({coinId}: {coinId: string}) {
    const [price, setPrice] = useState<string | null>(null);
    const [chartData, setChartData] = useState<{time: number, price: number}[]>([]);
    const currency = useSelector((state: RootState) => state.ui.currency);

    useEffect(() => {
      if (!coinId) return;
      let ws: WebSocket | null = null;
      let timeoutId: NodeJS.Timeout;

      const connect = () => {
        ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${coinId}`);
         console.log(`[WS] connection`);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data[coinId]) {
            const numericPrice = parseFloat(data[coinId]);
            setPrice(numericPrice.toLocaleString(undefined, {
              style: 'currency',
              currency: currency.toUpperCase(),
            }));

            setChartData((prev) => {
              const newPoint = {time: Date.now(), price: numericPrice};
              return [...prev, newPoint].slice(-20);
            })
          }
        };

        ws.onclose = (e) => {
          console.log(`[WS] connection lost. Code: ${e.code}. Reconnect 3s...`);
          timeoutId = setTimeout(connect, 3000);
        }

        ws.onerror = (err) => {
          ws?.close();
        }
      };

      connect();

      return () => {
        clearTimeout(timeoutId);
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
      </div>
    )

}
