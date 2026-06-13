import {
  BleError,
  BleManager,
  Device,
  State,
} from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

import type {
  ConnectedFartTagDevice,
  FartTagDevice,
} from '../../models/device';

type ScanHandlers = {
  onDeviceFound: (device: FartTagDevice) => void;
  onError: (error: Error) => void;
};

const manager = new BleManager();

const mapDevice = (device: Device): FartTagDevice => ({
  id: device.id,
  name: device.name ?? device.localName,
  source: 'ble',
  rssi: device.rssi,
});

const toError = (error: BleError): Error => new Error(error.message);

const isFartTag = (device: Device): boolean => {
  const name = device.name ?? device.localName ?? '';
  return name.toLowerCase().includes('farttag') || name.startsWith('FT-');
};

const requestAndroidPermissions = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  const permissions =
    Platform.Version >= 31
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const result = await PermissionsAndroid.requestMultiple(permissions);
  const denied = permissions.some(
    (permission) => result[permission] !== PermissionsAndroid.RESULTS.GRANTED,
  );

  if (denied) {
    throw new Error('Les permissions Bluetooth sont requises pour scanner.');
  }
};

const waitForPoweredOn = async (): Promise<void> => {
  const currentState = await manager.state();
  if (currentState === State.PoweredOn) {
    return;
  }

  throw new Error("Activez le Bluetooth avant de lancer le scan.");
};

export const BleService = {
  async startScan({ onDeviceFound, onError }: ScanHandlers): Promise<void> {
    await requestAndroidPermissions();
    await waitForPoweredOn();

    manager.stopDeviceScan();
    manager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        onError(toError(error));
        return;
      }

      if (device && isFartTag(device)) {
        onDeviceFound(mapDevice(device));
      }
    });
  },

  stopScan(): void {
    manager.stopDeviceScan();
  },

  async connectToDevice(deviceId: string): Promise<ConnectedFartTagDevice> {
    const device = await manager.connectToDevice(deviceId, { timeout: 10_000 });
    await device.discoverAllServicesAndCharacteristics();
    const mappedDevice = mapDevice(device);

    return {
      ...mappedDevice,
      name: mappedDevice.name ?? 'FartTag sans nom',
    };
  },
};
