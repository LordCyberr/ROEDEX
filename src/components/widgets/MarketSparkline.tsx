import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { marketDb } from '../../db/marketDb';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  itemName: string;
}

export const MarketSparkline: React.FC<Props> = ({ itemName }) => {
  const history = useLiveQuery(
    () => marketDb.marketHistory.where({ itemName }).sortBy('timestamp'),
    [itemName]
  );

  if (!history || history.length < 2) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 italic">
        Not enough historical data for sparkline
      </div>
    );
  }

  const data = history.map(h => ({
    date: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    price: h.priceEth
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
            itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="price" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
