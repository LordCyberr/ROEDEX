import React from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { motion } from 'motion/react';
import { Calendar, Target, Zap, Clock, Activity } from 'lucide-react';

export const DailyDashboard: React.FC = () => {
  const dailyLogs = useAnalyticsStore((state: any) => state.dailyLogs);
  const currentSessionId = useAnalyticsStore((state: any) => state.currentSessionId);
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs[today];

  const totalRunestones = todayLog ? Object.values(todayLog.sessions).reduce((acc: number, s: any) => acc + s.runestonesEarned - s.runestonesLost, 0) : 0;
  const isPositive = totalRunestones >= 0;

  return (
    <div className="flex flex-col gap-2 p-2 text-white select-none">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
        >
          {/* Subtle background watermark */}
          <div className="absolute -right-2 -bottom-2 text-cyan-400/5 pointer-events-none group-hover:text-cyan-400/10 transition-colors">
            <Calendar size={44} />
          </div>
          
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[9.5px] font-bold tracking-wider uppercase z-10">
            <Calendar size={12} className="text-cyan-400 shrink-0" />
            <span className="truncate">Today's Logins</span>
          </div>

          <div className="mt-1.5 z-10">
            <span className="text-xl font-black font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
              {todayLog?.logins || 0}
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
        >
          {/* Subtle background watermark */}
          <div className={`absolute -right-2 -bottom-2 ${isPositive ? 'text-emerald-400/5 group-hover:text-emerald-400/10' : 'text-rose-400/5 group-hover:text-rose-400/10'} pointer-events-none transition-colors`}>
            <Target size={44} />
          </div>

          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[9.5px] font-bold tracking-wider uppercase z-10">
            <Target size={12} className={`${isPositive ? 'text-emerald-400' : 'text-rose-400'} shrink-0`} />
            <span className="truncate">Net Runes</span>
          </div>

          <div className="mt-1.5 z-10">
            <span className={`text-xl font-black font-mono tracking-tight ${isPositive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}>
              {isPositive ? '+' : ''}{totalRunestones}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Level Up Indicator */}
      {todayLog && todayLog.levelUps > 0 && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-yellow-500/40 rounded-lg p-2 flex items-center gap-2.5 shadow-[0_0_12px_rgba(234,179,8,0.15)]"
        >
          <div className="bg-yellow-500/20 p-1.5 rounded-md text-yellow-400 shrink-0">
            <Zap size={15} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-yellow-400 font-bold text-[11px] leading-none">Level Up!</h4>
            <p className="text-yellow-200/70 text-[9px] mt-0.5 leading-tight">Advanced {todayLog.levelUps} time(s) today.</p>
          </div>
        </motion.div>
      )}

      {/* Session Timeline */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2.5 border border-[var(--border-subtle)] shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[9.5px] flex items-center gap-1.5">
            <Clock size={11} className="text-blue-400" /> Session Timeline
          </h3>
          {todayLog && Object.keys(todayLog.sessions).length > 0 && (
            <span className="text-[8.5px] font-mono font-bold bg-white/10 text-[var(--text-primary)] px-1.5 py-0.2 rounded">
              {Object.keys(todayLog.sessions).length} {Object.keys(todayLog.sessions).length === 1 ? 'Session' : 'Sessions'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {!todayLog || Object.keys(todayLog.sessions).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-[var(--text-muted)] text-[11px] gap-1">
              <Activity size={16} className="text-[var(--text-muted)] animate-pulse" />
              <span>No sessions recorded today.</span>
            </div>
          ) : (
            Object.values(todayLog.sessions).map((session: any, i) => (
              <div 
                key={session.id} 
                className={`flex items-center justify-between p-2 rounded-md border transition-all ${
                  currentSessionId === session.id 
                    ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                    : 'bg-[var(--bg-panel)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-accent)]'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px] text-white flex items-center gap-1.5 leading-none">
                    <span>Session {i + 1}</span>
                    {currentSessionId === session.id && (
                      <span className="text-[7.5px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 px-1.5 py-0.2 rounded-full animate-pulse tracking-wider">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ' Now'}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[11px] font-bold text-emerald-400">+{session.runestonesEarned}</div>
                  <div className="text-[9px] text-rose-400">-{session.runestonesLost}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
