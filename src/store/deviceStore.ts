import { create } from 'zustand';

import type { ConnectedFartTagDevice, FartTagDevice } from '../models/device';

type DeviceStore = {
  devices: FartTagDevice[];
  connectedDevice: ConnectedFartTagDevice | null;
  connectedDeviceId: string | null;
  isScanning: boolean;
  scanError: string | null;
  upsertDevice: (device: FartTagDevice) => void;
  setConnectedDevice: (device: ConnectedFartTagDevice) => void;
  disconnectDevice: () => void;
  renameConnectedDevice: (name: string) => void;
  setIsScanning: (isScanning: boolean) => void;
  setScanError: (error: string | null) => void;
  clearDevices: () => void;
};

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [],
  connectedDevice: null,
  connectedDeviceId: null,
  isScanning: false,
  scanError: null,
  upsertDevice: (device) =>
    set((state) => {
      const existingIndex = state.devices.findIndex(
        (candidate) => candidate.id === device.id,
      );

      if (existingIndex === -1) {
        return { devices: [...state.devices, device] };
      }

      return {
        devices: state.devices.map((candidate) =>
          candidate.id === device.id ? { ...candidate, ...device } : candidate,
        ),
      };
    }),
  setConnectedDevice: (device) =>
    set((state) => ({
      connectedDevice: device,
      connectedDeviceId: device.id,
      devices: state.devices.map((candidate) =>
        candidate.id === device.id ? { ...candidate, ...device } : candidate,
      ),
    })),
  disconnectDevice: () =>
    set({
      connectedDevice: null,
      connectedDeviceId: null,
    }),
  renameConnectedDevice: (name) =>
    set((state) => ({
      connectedDevice: state.connectedDevice
        ? { ...state.connectedDevice, name }
        : null,
      devices: state.devices.map((device) =>
        device.id === state.connectedDeviceId ? { ...device, name } : device,
      ),
    })),
  setIsScanning: (isScanning) => set({ isScanning }),
  setScanError: (scanError) => set({ scanError }),
  clearDevices: () => set({ devices: [] }),
}));
