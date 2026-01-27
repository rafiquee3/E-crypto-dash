import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function Chart({width, height, chartData, currencyCode = 'USD'} : {width: number | `${number}%`, height: number | `${number}%`, chartData: {time: number, price: number}[], currencyCode?: string}) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            hide={false}
            tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour12: false })}
          />
          <YAxis domain={['auto', 'auto']} hide={true} />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour12: false })}
            formatter={(value: number) => {
              return [
                new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: currencyCode.toUpperCase(),
                }).format(value),
                'Price'
              ];
            }}
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
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
  );
}
