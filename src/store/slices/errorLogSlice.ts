import { StateCreator } from 'zustand';
import { TrackerState, ErrorLogSlice } from '../storeTypes';

const MAX_ERROR_LOGS = 50;

export const createErrorLogSlice: StateCreator<
  TrackerState,
  [],
  [],
  ErrorLogSlice
> = (set, get) => ({
  errorLogs: [],
  
  logError: (message: string, stack?: string) => {
    const state = get();
    const newLog = {
      timestamp: new Date().toISOString(),
      message,
      stack,
      zone: state.playerZone || null
    };
    
    set((s) => {
      const updatedLogs = [newLog, ...s.errorLogs];
      if (updatedLogs.length > MAX_ERROR_LOGS) {
        updatedLogs.pop();
      }
      return { errorLogs: updatedLogs };
    });
  },
  
  clearErrors: () => {
    set({ errorLogs: [] });
  }
});
