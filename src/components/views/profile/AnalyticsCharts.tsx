import React, { useMemo } from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Coins, Pickaxe, Skull, BarChart3 } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const dailyLogs = useAnalyticsStore((state: any) => state.dailyLogs);

  const chartData = useMemo(() => {
    const dates = Object.keys(dailyLogs).sort();
    // Get last 7 days
    const recent = dates.slice(-7);
    if (recent.length === 0) {
      // Create empty 3-day baseline placeholder
      const today = new Date();
      const placeholder = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        placeholder.push({
          date: `${mm}-${dd}`,
          fullDate: d.toISOString().split('T')[0],
          earned: 0,
          lost: 0,
          quests: 0,
          netQuestProfit: 0,
          loot: 0,
          net: 0
        });
      }
      return placeholder;
    }

    return recent.map(date => {
      const log = dailyLogs[date];
      let earned = 0;
      let lost = 0;
      let quests = 0;
      let netQuestProfit = 0;
      let loot = 0;

      Object.values(log.sessions || {}).forEach((s: any) => {
        earned += s.runestonesEarned || 0;
        lost += s.runestonesLost || 0;
        quests += s.questEarnings || 0;
        netQuestProfit += s.netQuestProfit || 0;
        loot += s.lootValue || 0;
      });

      return {
        date: date.substring(5), // MM-DD
        fullDate: date,
        earned,
        lost,
        quests,
        netQuestProfit,
        loot,
        net: earned - lost
      };
    });
  }, [dailyLogs]);

  const todayData = chartData[chartData.length - 1];
  const hasData = chartData.some(d => d.earned > 0 || d.lost > 0 || d.net !== 0);

  return (
    <div className="flex flex-col gap-2 p-2 text-white select-none">
      {/* 7-Day Trend Chart */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5">
            <TrendingUp size={11} className="text-purple-400" /> 7-Day Net Runestones
          </h3>
          <span className="text-[8.5px] font-mono text-[var(--text-muted)] font-semibold">Past 7 Days</span>
        </div>

        <div className="h-28 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
              <XAxis dataKey="date" stroke="var(--border-accent)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--border-accent)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--bg-hover)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  borderColor: 'var(--border-subtle)', 
                  borderRadius: '6px', 
                  fontSize: '10px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                  color: 'var(--text-primary)'
                }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <Bar dataKey="net" radius={[2, 2, 0, 0]} maxBarSize={22}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#4ade80' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] text-[var(--text-muted)] font-mono bg-[var(--bg-panel)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                No activity recorded yet
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Session Breakdown (Today) */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md">
        <h3 className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-2">
          <BarChart3 size={11} className="text-cyan-400" /> Today's Economy Breakdown
        </h3>
        
        {todayData ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-panel)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-colors">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500/20 p-1 rounded-md text-amber-400"><Coins size={13} /></div>
                <div>
                  <div className="font-bold text-[11px] text-[var(--text-primary)] leading-none">Loot Value</div>
                  <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">Raw material drops</div>
                </div>
              </div>
              <div className="font-mono font-bold text-[11px] text-amber-400">+{todayData.loot}</div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-panel)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-colors">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/20 p-1 rounded-md text-purple-400"><Pickaxe size={13} /></div>
                <div>
                  <div className="font-bold text-[11px] text-[var(--text-primary)] leading-none">Quest Profit (Net)</div>
                  <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">Reward minus material cost</div>
                </div>
              </div>
              <div className={`font-mono font-bold text-[11px] ${todayData.netQuestProfit >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                {todayData.netQuestProfit > 0 ? '+' : ''}{todayData.netQuestProfit}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-[var(--bg-panel)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-colors">
              <div className="flex items-center gap-2">
                <div className="bg-rose-500/20 p-1 rounded-md text-rose-400"><Skull size={13} /></div>
                <div>
                  <div className="font-bold text-[11px] text-[var(--text-primary)] leading-none">Runestones Lost</div>
                  <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">Deaths & Spending</div>
                </div>
              </div>
              <div className="font-mono font-bold text-[11px] text-rose-400">-{todayData.lost}</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-muted)] py-3 italic text-[10px]">No data available for today yet.</div>
        )}
      </div>
    </div>
  );
};
