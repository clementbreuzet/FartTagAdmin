import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIcon } from '../components/navigation/TabIcon';
import { useI18n } from '../i18n/I18nProvider';
import { AdvancedSettingsScreen } from '../screens/calibration/AdvancedSettingsScreen';
import { CalibrationProfilesScreen } from '../screens/calibration/CalibrationProfilesScreen';
import { CalibrationResultsScreen } from '../screens/calibration/CalibrationResultsScreen';
import { CalibrationWizardScreen } from '../screens/calibration/CalibrationWizardScreen';
import { AudioAnalysisScreen } from '../screens/dashboard/AudioAnalysisScreen';
import { GasAnalysisScreen } from '../screens/dashboard/GasAnalysisScreen';
import { LiveDashboardScreen } from '../screens/dashboard/LiveDashboardScreen';
import { DeviceInfoScreen } from '../screens/devices/DeviceInfoScreen';
import { DeviceScannerScreen } from '../screens/devices/DeviceScannerScreen';
import { EventLogsScreen } from '../screens/logs/EventLogsScreen';
import { DetectionModelScreen } from '../screens/settings/DetectionModelScreen';
import { FirmwareScreen } from '../screens/settings/FirmwareScreen';
import { colors } from '../theme/colors';
import type {
  CalibrationStackParamList,
  DashboardStackParamList,
  DevicesStackParamList,
  LogsStackParamList,
  RootTabParamList,
  SettingsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const DevicesStack = createNativeStackNavigator<DevicesStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const CalibrationStack = createNativeStackNavigator<CalibrationStackParamList>();
const LogsStack = createNativeStackNavigator<LogsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const stackOptions = {
  contentStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
};

const DevicesNavigator = () => {
  const { t } = useI18n();
  return (
    <DevicesStack.Navigator screenOptions={stackOptions}>
      <DevicesStack.Screen component={DeviceScannerScreen} name="DeviceScannerScreen" options={{ headerShown: false }} />
      <DevicesStack.Screen component={DeviceInfoScreen} name="DeviceInfoScreen" options={{ title: t('screen.deviceInfo') }} />
    </DevicesStack.Navigator>
  );
};

const DashboardNavigator = () => {
  const { t } = useI18n();
  return (
    <DashboardStack.Navigator screenOptions={stackOptions}>
      <DashboardStack.Screen component={LiveDashboardScreen} name="LiveDashboardScreen" options={{ headerShown: false }} />
      <DashboardStack.Screen component={AudioAnalysisScreen} name="AudioAnalysisScreen" options={{ title: t('screen.audioAnalysis') }} />
      <DashboardStack.Screen component={GasAnalysisScreen} name="GasAnalysisScreen" options={{ title: t('screen.gasAnalysis') }} />
    </DashboardStack.Navigator>
  );
};

const CalibrationNavigator = () => {
  const { t } = useI18n();
  return (
    <CalibrationStack.Navigator screenOptions={stackOptions}>
    <CalibrationStack.Screen
      component={CalibrationWizardScreen}
      name="CalibrationWizardScreen"
      options={{ headerShown: false }}
    />
      <CalibrationStack.Screen component={CalibrationResultsScreen} name="CalibrationResultsScreen" options={{ title: t('screen.calibrationResults') }} />
      <CalibrationStack.Screen component={AdvancedSettingsScreen} name="AdvancedSettingsScreen" options={{ title: t('screen.advancedSettings') }} />
      <CalibrationStack.Screen component={CalibrationProfilesScreen} name="CalibrationProfilesScreen" options={{ title: t('screen.profiles') }} />
    </CalibrationStack.Navigator>
  );
};

const LogsNavigator = () => (
  <LogsStack.Navigator screenOptions={stackOptions}>
    <LogsStack.Screen component={EventLogsScreen} name="EventLogsScreen" options={{ headerShown: false }} />
  </LogsStack.Navigator>
);

const SettingsNavigator = () => {
  const { t } = useI18n();
  return (
    <SettingsStack.Navigator screenOptions={stackOptions}>
    <SettingsStack.Screen
      component={DetectionModelScreen}
      name="DetectionModelScreen"
      options={{ headerShown: false }}
    />
      <SettingsStack.Screen component={FirmwareScreen} name="FirmwareScreen" options={{ title: t('screen.firmware') }} />
    </SettingsStack.Navigator>
  );
};

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const bottomInset = Math.max(insets.bottom, 7);

  return (
    <Tab.Navigator
      initialRouteName="DevicesTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        popToTopOnBlur: true,
        tabBarActiveTintColor: colors.neonGreen,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon color={color} focused={focused} name={route.name} />
        ),
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 61 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
      })}
    >
      <Tab.Screen component={DevicesNavigator} name="DevicesTab" options={{ title: t('nav.devices') }} />
      <Tab.Screen component={DashboardNavigator} name="DashboardTab" options={{ title: t('nav.dashboard') }} />
      <Tab.Screen component={CalibrationNavigator} name="CalibrationTab" options={{ title: t('nav.calibration') }} />
      <Tab.Screen component={LogsNavigator} name="LogsTab" options={{ title: t('nav.logs') }} />
      <Tab.Screen component={SettingsNavigator} name="SettingsTab" options={{ title: t('nav.settings') }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#05070A',
    borderTopColor: colors.neonGreen,
    borderTopWidth: 0.5,
    paddingTop: 6,
  },
  tabLabel: { fontSize: 9, fontWeight: '700' },
});

export default TabNavigator;
