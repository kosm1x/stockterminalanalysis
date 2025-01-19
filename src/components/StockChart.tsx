import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { StockAnalysis } from '../types/stock';
import { format, subMonths, parseISO } from 'date-fns';

interface StockChartProps {
  stock: StockAnalysis;
}

type TimeFrame = '3m' | '6m' | '1y' | '2y' | '5y';
type SignalType = 'entry' | 'exit';

interface Signal {
  index: number;
  type: SignalType;
  reason: string;
}

// Mock company data - in a real app, this would come from an API
const COMPANY_INFO: Record<string, { name: string }> = {
  // Technology
  'AAPL': { name: 'Apple Inc.' },
  'MSFT': { name: 'Microsoft Corporation' },
  'GOOGL': { name: 'Alphabet Inc.' },
  'AMZN': { name: 'Amazon.com Inc.' },
  'NVDA': { name: 'NVIDIA Corporation' },
  'META': { name: 'Meta Platforms Inc.' },
  'TSLA': { name: 'Tesla Inc.' },
  'IBM': { name: 'International Business Machines' },
  'ORCL': { name: 'Oracle Corporation' },
  'CRM': { name: 'Salesforce Inc.' },
  
  // Healthcare
  'JNJ': { name: 'Johnson & Johnson' },
  'UNH': { name: 'UnitedHealth Group' },
  'PFE': { name: 'Pfizer Inc.' },
  'MRK': { name: 'Merck & Co.' },
  'ABT': { name: 'Abbott Laboratories' },
  
  // Financial Services
  'JPM': { name: 'JPMorgan Chase & Co.' },
  'V': { name: 'Visa Inc.' },
  'BAC': { name: 'Bank of America Corp' },
  'WFC': { name: 'Wells Fargo & Co' },
  'MA': { name: 'Mastercard Inc.' },
  
  // Consumer Cyclical
  'HD': { name: 'Home Depot Inc.' },
  'NKE': { name: 'Nike Inc.' },
  'MCD': { name: "McDonald's Corp" },
  'SBUX': { name: 'Starbucks Corp' },
  'DIS': { name: 'Walt Disney Co' },
  
  // Industrials
  'CAT': { name: 'Caterpillar Inc.' },
  'BA': { name: 'Boeing Co' },
  'HON': { name: 'Honeywell International' },
  'UPS': { name: 'United Parcel Service' },
  'GE': { name: 'General Electric Co' },
  
  // Energy
  'XOM': { name: 'Exxon Mobil Corp' },
  'CVX': { name: 'Chevron Corp' },
  'COP': { name: 'ConocoPhillips' },
  'SLB': { name: 'Schlumberger NV' },
  'EOG': { name: 'EOG Resources Inc' }
};

export const StockChart: React.FC<StockChartProps> = ({ stock }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1y');

  const timeFrames: { value: TimeFrame; label: string }[] = [
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '5y', label: '5 Years' },
  ];

  const findSignals = (data: any[]) => {
    const signals: Signal[] = [];
    const BOTTOM_PERCENTILE = -0.8;
    const TOP_PERCENTILE = 0.9;
    
    for (let i = 4; i < data.length; i++) {
      const prevSum = data[i-1].normalizedSum;
      const currentSum = data[i].normalizedSum;
      const last5Values = data.slice(i-4, i+1).map(d => d.normalizedSum);
      
      if (prevSum < 0 && currentSum >= 0) {
        signals.push({ 
          index: i,
          type: 'entry',
          reason: 'Zero crossing'
        });
      }

      const wasInBottomPercentile = last5Values.slice(0, 3).every(v => v <= BOTTOM_PERCENTILE);
      const isIncreasing = last5Values[3] > last5Values[2] && last5Values[4] > last5Values[3];
      const gotOutOfBottomPercentile = last5Values[4] > BOTTOM_PERCENTILE;

      if (wasInBottomPercentile && isIncreasing && gotOutOfBottomPercentile) {
        signals.push({ 
          index: i,
          type: 'entry',
          reason: 'Bottom percentile reversal'
        });
      }

      if (prevSum > 0 && currentSum <= 0) {
        signals.push({ 
          index: i,
          type: 'exit',
          reason: 'Zero crossing'
        });
      }

      const wasInTopPercentile = last5Values.slice(0, 3).every(v => v >= TOP_PERCENTILE);
      const isDecreasing = last5Values[3] < last5Values[2] && last5Values[4] < last5Values[3];
      const gotOutOfTopPercentile = last5Values[4] < TOP_PERCENTILE;

      if (wasInTopPercentile && isDecreasing && gotOutOfTopPercentile) {
        signals.push({ 
          index: i,
          type: 'exit',
          reason: 'Top percentile reversal'
        });
      }
    }
    return signals;
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoffDate = (() => {
      switch (timeFrame) {
        case '3m': return subMonths(now, 3);
        case '6m': return subMonths(now, 6);
        case '1y': return subMonths(now, 12);
        case '2y': return subMonths(now, 24);
        case '5y': return subMonths(now, 60);
      }
    })();

    const rawData = stock.data.map((d, i) => {
      const ao = stock.indicators[i]?.ao || 0;
      const ac = stock.indicators[i]?.ac || 0;
      return {
        ...d,
        ao,
        ac,
        sum: ao + ac,
        volume: d.volume // Ensure volume is included
      };
    });

    const sums = rawData.map(d => d.sum).filter(sum => !isNaN(sum));
    const maxAbs = Math.max(Math.abs(Math.min(...sums)), Math.abs(Math.max(...sums)));

    const dataWithNormalizedSum = rawData.map((d) => ({
      ...d,
      normalizedSum: maxAbs === 0 ? 0 : d.sum / maxAbs,
      formattedDate: format(parseISO(d.date), 'MMM dd, yyyy'),
    }));

    const signals = findSignals(dataWithNormalizedSum);
    
    return dataWithNormalizedSum.map((d, i) => {
      const signal = signals.find(s => s.index === i);
      return {
        ...d,
        signal: signal?.type,
        signalReason: signal?.reason
      };
    }).filter(d => parseISO(d.date) >= cutoffDate);
  }, [stock, timeFrame]);

  const formatValue = (value: number) => value.toFixed(2);
  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  const companyName = COMPANY_INFO[stock.symbol]?.name || 'Unknown Company';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-300 mb-2">{label}</p>
          <p className="text-emerald-400 text-sm font-medium mb-2">{companyName}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Volume' ? formatVolume(entry.value) : formatValue(entry.value)}
            </p>
          ))}
          {dataPoint.signal && (
            <p className={`text-sm font-semibold mt-1 ${
              dataPoint.signal === 'entry' ? 'text-green-500' : 'text-red-500'
            }`}>
              {dataPoint.signal === 'entry' ? 'Entry' : 'Exit'} Signal: {dataPoint.signalReason}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        {timeFrames.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTimeFrame(value)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeFrame === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <ComposedChart 
            data={filteredData} 
            margin={{ top: 30, right: 30, bottom: 65, left: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#9CA3AF"
              tick={{ 
                fill: '#9CA3AF', 
                fontSize: 11,
                angle: 90,
                textAnchor: 'start',
                dy: 8
              }}
              height={60}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="price"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={formatValue}
              label={{ 
                value: 'Price',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#9CA3AF', fontSize: 12 }
              }}
            />
            <YAxis 
              yAxisId="oscillator"
              orientation="right"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={formatValue}
              label={{ 
                value: 'Oscillators',
                angle: 90,
                position: 'insideRight',
                style: { fill: '#9CA3AF', fontSize: 12 }
              }}
            />
            <YAxis 
              yAxisId="normalized"
              orientation="right"
              stroke="#FACC15"
              domain={[-1, 1]}
              tick={{ fill: '#FACC15', fontSize: 11 }}
              tickFormatter={value => value.toFixed(1)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="volume"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={false}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconSize={8} 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar
              dataKey="volume"
              yAxisId="volume"
              fill="#374151"
              opacity={0.3}
              name="Volume"
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="close"
              stroke="#FFFFFF"
              strokeWidth={2}
              yAxisId="price"
              name="Price"
              dot={(props: any) => {
                if (props.payload.signal) {
                  return (
                    <circle
                      key={`dot-${props.payload.date}`}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={props.payload.signal === 'entry' ? '#22C55E' : '#EF4444'}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="ao"
              stroke="#3B82F6"
              strokeWidth={1}
              yAxisId="oscillator"
              name="AO"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="ac"
              stroke="#EC4899"
              strokeWidth={1}
              yAxisId="oscillator"
              name="AC"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="normalizedSum"
              stroke="#FACC15"
              strokeWidth={1}
              strokeDasharray="5 5"
              yAxisId="normalized"
              name="AO+AC"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};