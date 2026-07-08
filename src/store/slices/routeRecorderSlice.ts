import { StateCreator } from 'zustand';
import { RouteRecorderSlice, TrackerState, RoutePoint } from '../storeTypes';

export const createRouteRecorderSlice: StateCreator<
  TrackerState,
  [],
  [],
  RouteRecorderSlice
> = (set, get) => ({
  isRecording: false,
  recordedRoute: [],
  lastRecordedMoveTime: 0,
  
  startRecording: () => {
    set({ isRecording: true });
  },
  
  stopRecording: () => {
    set({ isRecording: false });
  },
  
  addRoutePoint: (point: Omit<RoutePoint, 'timestamp'>) => {
    const state = get();
    if (!state.isRecording && point.action !== 'custom_marker') return;
    
    const now = Date.now();
    
    // Throttle move events to once per second to keep file size small
    if (point.action === 'move') {
      if (now - state.lastRecordedMoveTime < 1000) {
        return;
      }
      set(s => ({
        recordedRoute: [...s.recordedRoute, { ...point, timestamp: Math.floor(now / 1000) }],
        lastRecordedMoveTime: now
      }));
    } else {
      // Actions like kill, gather, enter_zone are recorded immediately
      set(s => ({
        recordedRoute: [...s.recordedRoute, { ...point, timestamp: Math.floor(now / 1000) }]
      }));
    }
  },
  
  exportRoute: () => {
    const state = get();
    if (state.recordedRoute.length === 0) return;
    
    const dataStr = JSON.stringify(state.recordedRoute, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `roedex_optimal_route_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },
  
  clearRoute: () => {
    set({ recordedRoute: [] });
  }
});
