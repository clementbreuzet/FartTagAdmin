import { create } from 'zustand';

import type { EventLog } from '../models/eventLog';

type LogStore = {
  logs: EventLog[];
  addLog: (log: EventLog) => void;
  clearLogs: () => void;
};

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs.filter((candidate) => candidate.id !== log.id)],
    })),
  clearLogs: () => set({ logs: [] }),
}));
