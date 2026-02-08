'use client';
import React, { useEffect, useState } from 'react';

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const initMsw = async () => {
        const { worker } = await import('../mocks/browser');
        await worker.start({
          onUnhandledRequest: 'bypass', // for Websocket CoinCap
        });
        setIsReady(true);
      };

      //initMsw();
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <div>Dev init...</div>;
  }

  return <>{children}</>;
}
