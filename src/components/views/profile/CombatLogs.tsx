import React, { useMemo } from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { Skull, Swords, Map, ShieldAlert, Compass } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

export const CombatLogs: React.FC = () => {
  const dailyLogs = useAnalyticsStore(state => state.dailyLogs);
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs[today];

  const { totalDeaths, mobData, zoneData } = useMemo(() => {
    let tDeaths = 0;
    const mobs: Record<string, number> = {};
    const zones: Record<string, number> = {};

    if (todayLog) {
      Object.values(todayLog.sessions || {}).forEach((s: any) => {
        tDeaths += s.deaths || 0;
        
        Object.entries(s.mobKills || {}).forEach(([mob, count]: [string, any]) => {
          mobs[mob] = (mobs[mob] || 0) + count;
        });
        Object.entries(s.zoneTime || {}).forEach(([zone, time]: [string, any]) => {
          zones[zone] = (zones[zone] || 0) + time;
        });
      });
    }

    const mData = Object.entries(mobs)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const zData = Object.entries(zones)
      .map(([name, value]) => ({ name, timeMinutes: Math.max(1, Math.round(value / 60000)) }))
      .sort((a, b) => b.timeMinutes - a.timeMinutes);

    return { totalDeaths: tDeaths, mobData: mData, zoneData: zData };
  }, [todayLog]);

  return (
    <div className="flex flex-col gap-2 p-2 text-white select-none">
      {/* Death Ledger */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md flex items-center justify-between hover:border-rose-500/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500/20 p-1.5 rounded-md text-rose-400">
            <Skull size={15} />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-bold text-xs leading-none">Death Ledger</h3>
            <p className="text-[var(--text-secondary)] text-[9px] mt-0.5">Times you died today</p>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
            {totalDeaths}
          </div>
        </div>
      </div>

      {/* Mob Farm Breakdown */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5">
            <Swords size={11} className="text-rose-400" /> Mob Farm Breakdown
          </h3>
          {mobData.length > 0 && (
            <span className="text-[8.5px] font-mono text-[var(--text-muted)] font-semibold">
              {mobData.reduce((acc, m) => acc + m.value, 0)} Total Kills
            </span>
          )}
        </div>
        
        {mobData.length > 0 ? (
          <div className="h-28 w-full flex items-center gap-2">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mobData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={38}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {mobData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-panel)', 
                      borderColor: 'var(--border-subtle)', 
                      borderRadius: '6px',
                      fontSize: '10px' 
                    }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {mobData.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between text-[9.5px] bg-[var(--bg-panel)]/50 px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[var(--text-primary)] truncate max-w-[65px]">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--text-primary)] shrink-0">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-[var(--text-muted)] text-[11px] gap-1">
            <ShieldAlert size={16} className="text-[var(--text-muted)] animate-pulse" />
            <span>No mobs killed today.</span>
          </div>
        )}
      </div>

      {/* Zone Efficiency */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md">
        <h3 className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 mb-2">
          <Map size={11} className="text-blue-400" /> Zone Time Tracker
        </h3>
        <div className="flex flex-col gap-1">
          {zoneData.length > 0 ? (
            zoneData.map((z) => (
              <div key={z.name} className="flex justify-between items-center text-[11px] p-1.5 rounded-md bg-[var(--bg-panel)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-colors">
                <span className="text-[var(--text-primary)] font-medium truncate">{z.name}</span>
                <span className="font-mono font-bold text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                  {z.timeMinutes}m
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-[var(--text-muted)] text-[11px] gap-1">
              <Compass size={16} className="text-[var(--text-muted)] animate-pulse" />
              <span>No zones explored today.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
