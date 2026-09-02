import React, { useMemo } from 'react';
import { useMarketDatabaseStore } from '../../../store/marketDatabaseStore';
import { useTrackerStore } from '../../../store/trackerStore';
import { useMarketHistory } from '../../../store/hooks/useMarketSelector';
import { useMarketCurrencyPref } from '../../../store/hooks/useSettingsSelector';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MarketplaceAnalyticsTab: React.FC = () => {
  const getMarketAnalysis = useMarketDatabaseStore(s => s.getMarketAnalysis);
  const marketHistory = useMarketHistory();
  const { marketEthUsd } = useTrackerStore();
  const marketCurrencyPref = useMarketCurrencyPref();

  const formatPrice = (val: number) => {
    if (!val) return '0.00';
    if (marketCurrencyPref === 'USD') {
      const usd = val * marketEthUsd;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: usd < 0.01 ? 4 : 2 }).format(usd);
    }
    return `Ξ ${val.toLocaleString(undefined, { maximumFractionDigits: 6, minimumFractionDigits: 2 })}`;
  };

  const analyzedItems = useMemo(() => {
    const days = Object.keys(marketHistory || {}).sort();
    if (days.length === 0) return [];
    
    const latestDay = days[days.length - 1];
    const items = marketHistory[latestDay]?.items || {};
    
    return Object.entries(items).map(([itemId, data]: [string, any]) => {
      const analysis = getMarketAnalysis(itemId);
      return {
        itemId,
        data,
        analysis
      };
    }).sort((a, b) => {
      const changeA = Math.abs(a.analysis?.priceChange7d || 0);
      const changeB = Math.abs(b.analysis?.priceChange7d || 0);
      return changeB - changeA;
    });
  }, [marketHistory, getMarketAnalysis]);

  if (analyzedItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic p-10 select-none">
        No historical market data recorded yet. Keep ROEDEX open while interacting with the marketplace to build daily snapshots!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 m-4 shadow-xl select-none">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-cyan-400" />
        <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">Market Analytics & Price Trends</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="text-[9px] uppercase font-black text-slate-500 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 border-b border-white/10">
            <tr>
              <th className="py-2 px-3">Item ID</th>
              <th className="py-2 px-3 text-right">Floor Price</th>
              <th className="py-2 px-3 text-right">Avg Price</th>
              <th className="py-2 px-3 text-right">7D Change</th>
              <th className="py-2 px-3 text-right">30D Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {analyzedItems.map(({ itemId, data, analysis }) => {
              const p7d = analysis?.priceChange7d || 0;
              const p30d = analysis?.priceChange30d || 0;
              
              const renderChange = (val: number) => {
                if (val > 0) return <span className="text-emerald-400 flex items-center justify-end gap-1"><TrendingUp size={10}/> +{val.toFixed(2)}%</span>;
                if (val < 0) return <span className="text-rose-400 flex items-center justify-end gap-1"><TrendingDown size={10}/> {val.toFixed(2)}%</span>;
                return <span className="text-slate-500 flex items-center justify-end gap-1"><Minus size={10}/> 0.00%</span>;
              };

              return (
                <tr key={itemId} className="hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-300">{itemId}</td>
                  <td className="py-2 px-3 font-mono text-emerald-400 text-right">{formatPrice(Number(data?.minPrice || 0))}</td>
                  <td className="py-2 px-3 font-mono text-blue-400 text-right">{formatPrice(Number(data?.avgPrice || 0))}</td>
                  <td className="py-2 px-3 font-mono text-right">{renderChange(p7d)}</td>
                  <td className="py-2 px-3 font-mono text-right">{renderChange(p30d)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
