import { create } from 'zustand';

import type {
  CalibrationConfiguration,
  CalibrationProfile,
  ManualCalibrationConfiguration,
} from '../models/calibration';

type CalibrationStore = {
  activeProfileId: string | null;
  appliedConfiguration: CalibrationConfiguration | null;
  appliedManualConfiguration: ManualCalibrationConfiguration | null;
  savedManualConfiguration: ManualCalibrationConfiguration | null;
  profiles: CalibrationProfile[];
  applyConfiguration: (configuration: CalibrationConfiguration) => void;
  applyProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  duplicateProfile: (profileId: string) => void;
  applyManualConfiguration: (
    configuration: ManualCalibrationConfiguration,
  ) => void;
  saveManualConfiguration: (
    configuration: ManualCalibrationConfiguration,
  ) => void;
  saveProfile: (profile: CalibrationProfile) => void;
};

export const useCalibrationStore = create<CalibrationStore>((set) => ({
  activeProfileId: null,
  appliedConfiguration: null,
  appliedManualConfiguration: null,
  savedManualConfiguration: null,
  profiles: [],
  applyConfiguration: (appliedConfiguration) => set({ appliedConfiguration }),
  applyProfile: (profileId) =>
    set((state) => {
      const profile = state.profiles.find((candidate) => candidate.id === profileId);

      return profile
        ? { activeProfileId: profileId, appliedConfiguration: profile }
        : {};
    }),
  deleteProfile: (profileId) =>
    set((state) => ({
      activeProfileId:
        state.activeProfileId === profileId ? null : state.activeProfileId,
      profiles: state.profiles.filter((profile) => profile.id !== profileId),
    })),
  duplicateProfile: (profileId) =>
    set((state) => {
      const profile = state.profiles.find((candidate) => candidate.id === profileId);

      if (!profile) {
        return {};
      }

      const createdAt = new Date().toISOString();
      return {
        profiles: [
          {
            ...profile,
            id: `${createdAt}-${profile.id}`,
            name: `${profile.name} (copie)`,
            createdAt,
          },
          ...state.profiles,
        ],
      };
    }),
  applyManualConfiguration: (appliedManualConfiguration) =>
    set({ appliedManualConfiguration }),
  saveManualConfiguration: (savedManualConfiguration) =>
    set({ savedManualConfiguration }),
  saveProfile: (profile) =>
    set((state) => ({
      profiles: [
        profile,
        ...state.profiles.filter((candidate) => candidate.id !== profile.id),
      ],
    })),
}));
