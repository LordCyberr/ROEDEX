import { create } from 'zustand';

export interface BlacksmithJob {
  instanceId: string;
  itemName: string;
  startTime: number;
  endTime: number;
  duration: number;
  mode: string;
  notified: boolean;
}

interface BlacksmithStore {
  activeJobs: BlacksmithJob[];
  setJobs: (jobs: BlacksmithJob[]) => void;
  removeJob: (instanceId: string) => void;
  markNotified: (instanceId: string) => void;
  clearJobs: () => void;
}

export const useBlacksmithStore = create<BlacksmithStore>((set) => ({
  activeJobs: [],
  setJobs: (jobs) => set({ activeJobs: jobs }),
  removeJob: (instanceId) => set((state) => ({ 
    activeJobs: state.activeJobs.filter(j => j.instanceId !== instanceId) 
  })),
  markNotified: (instanceId) => set((state) => ({
    activeJobs: state.activeJobs.map(j => 
      j.instanceId === instanceId ? { ...j, notified: true } : j
    )
  })),
  clearJobs: () => set({ activeJobs: [] })
}));
