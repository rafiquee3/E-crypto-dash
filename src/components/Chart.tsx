import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useState, useEffect, useRef } from 'react';

interface ChartProps {
  chartData: { time: number; price: number }[];
  currencyCode: string;
  ariaLabel?: string;
  days?: number;
}

export function Chart({ chartData, currencyCode, ariaLabel, days = 1 }: ChartProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const date = new Date(time);
    if (days >= 7) {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Use ResizeObserver to detect when the container actually has a size
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // Use contentRect for precise content box dimensions
      const { width } = entry.contentRect;

      // Only update if width is valid and positive
      if (width > 0) {
        // Force a 2:1 aspect ratio based on width
        setDimensions({
          width: width,
          height: width / 2,
        });
      }
    });

    observer.observe(containerRef.current);

    // Initial fallback check
    if (containerRef.current.clientWidth > 0) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientWidth / 2,
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full relative"
      style={{ aspectRatio: '2/1' }}
      role="img"
      aria-label={ariaLabel || 'Cryptocurrency price chart'}
    >
      <span className="sr-only">{ariaLabel || 'Line chart showing price history over time.'}</span>
      {dimensions ? (
        <AreaChart
          width={dimensions.width}
          height={dimensions.height}
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            hide={false}
            tickFormatter={formatTime}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis domain={['auto', 'auto']} hide={true} />
          <Tooltip
            labelFormatter={formatTime}
            formatter={(value: number) => {
              return [
                new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: currencyCode.toUpperCase(),
                }).format(value),
                'Price',
              ];
            }}
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#a1a1aa', marginBottom: '0.5rem' }}
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
      ) : (
        // Placeholder matching the aspect ratio to prevent CLS
        <div className="w-full h-full bg-gray-900/5 animate-pulse rounded-xl" />
      )}
    </div>
  );
}
