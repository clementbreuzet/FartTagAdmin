export type DeviceStatus = 'available' | 'connected' | 'weak-signal';
export type DeviceSource = 'ble' | 'phoneMic';

export type FartTagDevice = {
  id: string;
  name: string | null;
  source: DeviceSource;
  rssi: number | null;
  batteryLevel?: number | null;
  batteryVoltage?: number | null;
  firmwareVersion?: string | null;
  hardwareRevision?: string | null;
  uptimeSeconds?: number | null;
  bleProtocolVersion?: string | null;
};

export type ConnectedFartTagDevice = FartTagDevice & {
  name: string;
};
