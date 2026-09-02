import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createIndexedDBStorage } from './indexedDBStorage';

export interface GameSession {
  id: string;
  startTime: number;
  endTime: number | null;
  runestonesEarned: number;
  runestonesLost: number;
  questEarnings: number;
  netQuestProfit: number;
  lootValue: number;
  deaths: number;
  mobKills: Record<string, number>;
  zoneTime: Record<string, number>;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  logins: number;
  levelUps: number;
  sessions: Record<string, GameSession>;
}

interface AnalyticsState {
  dailyLogs: Record<string, DailyLog>;
  currentSessionId: string | null;

  // Actions
  startSession: () => void;
  endSession: () => void;
  recordLogin: () => void;
  recordLevelUp: () => void;
  addRunestonesEarned: (amount: number) => void;
  addRunestonesLost: (amount: number) => void;
  addQuestEarnings: (reward: number, materialCost: number) => void;
  addLootValue: (value: number) => void;
  recordDeath: () => void;
  recordMobKill: (entityId: string) => void;
  addZoneTime: (zoneName: string, timeMs: number) => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const createEmptySession = (id: string): GameSession => ({
  id,
  startTime: Date.now(),
  endTime: null,
  runestonesEarned: 0,
  runestonesLost: 0,
  questEarnings: 0,
  netQuestProfit: 0,
  lootValue: 0,
  deaths: 0,
  mobKills: {},
  zoneTime: {}
});

const createEmptyDailyLog = (date: string): DailyLog => ({
  date,
  logins: 0,
  levelUps: 0,
  sessions: {}
});

const indexedDBStorage = createIndexedDBStorage('roedex-analytics-db', 2000, 'analytics-backup');

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      dailyLogs: {},
      currentSessionId: null,

      startSession: () => {
        const today = getTodayDateString();
        const sessionId = Date.now().toString();
        
        set((state) => {
          const logs = { ...state.dailyLogs };
          if (!logs[today]) {
            logs[today] = createEmptyDailyLog(today);
          }
          logs[today].sessions[sessionId] = createEmptySession(sessionId);
          return { dailyLogs: logs, currentSessionId: sessionId };
        });
      },

      endSession: () => {
        set((state) => {
          if (!state.currentSessionId) return state;
          
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            logs[today].sessions[state.currentSessionId].endTime = Date.now();
          }
          
          return { dailyLogs: logs, currentSessionId: null };
        });
      },

      recordLogin: () => {
        const today = getTodayDateString();
        set((state) => {
          const logs = { ...state.dailyLogs };
          if (!logs[today]) logs[today] = createEmptyDailyLog(today);
          logs[today].logins += 1;
          return { dailyLogs: logs };
        });
      },

      recordLevelUp: () => {
        const today = getTodayDateString();
        set((state) => {
          const logs = { ...state.dailyLogs };
          if (!logs[today]) logs[today] = createEmptyDailyLog(today);
          logs[today].levelUps += 1;
          return { dailyLogs: logs };
        });
      },

      addRunestonesEarned: (amount) => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            logs[today].sessions[state.currentSessionId].runestonesEarned += amount;
          }
          return { dailyLogs: logs };
        });
      },

      addRunestonesLost: (amount) => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            logs[today].sessions[state.currentSessionId].runestonesLost += amount;
          }
          return { dailyLogs: logs };
        });
      },

      addQuestEarnings: (reward, materialCost) => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            logs[today].sessions[state.currentSessionId].questEarnings += reward;
            logs[today].sessions[state.currentSessionId].netQuestProfit += (reward - materialCost);
          }
          return { dailyLogs: logs };
        });
      },

      addLootValue: (value) => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            logs[today].sessions[state.currentSessionId].lootValue += value;
          }
          return { dailyLogs: logs };
        });
      },

      recordDeath: () => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            logs[today].sessions[state.currentSessionId].deaths += 1;
          }
          return { dailyLogs: logs };
        });
      },

      recordMobKill: (entityId) => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            const kills = logs[today].sessions[state.currentSessionId].mobKills;
            kills[entityId] = (kills[entityId] || 0) + 1;
          }
          return { dailyLogs: logs };
        });
      },

      addZoneTime: (zoneName, timeMs) => {
        set((state) => {
          if (!state.currentSessionId) return state;
          const today = getTodayDateString();
          const logs = { ...state.dailyLogs };
          if (logs[today] && logs[today].sessions[state.currentSessionId]) {
            const zt = logs[today].sessions[state.currentSessionId].zoneTime;
            zt[zoneName] = (zt[zoneName] || 0) + timeMs;
          }
          return { dailyLogs: logs };
        });
      }
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      merge: (persistedState: any, currentState) => {
        // Prune logs older than 30 days to prevent unbounded IndexedDB growth
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        const prunedLogs: Record<string, any> = {};
        if (persistedState?.dailyLogs) {
          for (const [date, log] of Object.entries(persistedState.dailyLogs)) {
            if (date >= cutoffDate) {
              prunedLogs[date] = log;
            }
          }
        }

        return {
          ...currentState,
          ...persistedState,
          dailyLogs: prunedLogs,
        };
      },
    }
  )
);
