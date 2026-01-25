'use client';
import { useEffect, useState } from "react";

export function CoinCapStream({coinId}: {coinId: string}) {
    const [price, setPrice] = useState<string | null>(null);

    useEffect(() => {
      const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${coinId}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data[coinId]) {
          setPrice(parseFloat(data[coinId]).toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          }));
        }
      };

      return () => ws.close();
    }, [coinId]);

    return (
      <div>
        <p>price: {price || 'loading data'}</p>
      </div>
    )

}
