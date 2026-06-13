import type { NavigatorScreenParams } from '@react-navigation/native';

import type { CalibrationResults } from '../models/calibration';

export type DevicesStackParamList = {
  DeviceScannerScreen: undefined;
  DeviceInfoScreen: undefined;
};

export type DashboardStackParamList = {
  LiveDashboardScreen: undefined;
  AudioAnalysisScreen: undefined;
  GasAnalysisScreen: undefined;
};

export type CalibrationStackParamList = {
  CalibrationWizardScreen: undefined;
  CalibrationResultsScreen: { results: CalibrationResults };
  AdvancedSettingsScreen: undefined;
  CalibrationProfilesScreen: undefined;
};

export type LogsStackParamList = {
  EventLogsScreen: undefined;
};

export type SettingsStackParamList = {
  DetectionModelScreen: undefined;
  FirmwareScreen: undefined;
};

export type RootTabParamList = {
  DevicesTab: NavigatorScreenParams<DevicesStackParamList>;
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  CalibrationTab: NavigatorScreenParams<CalibrationStackParamList>;
  LogsTab: NavigatorScreenParams<LogsStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};
