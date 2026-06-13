import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'SettingsScreen'>;

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>FARTTAG SOCIAL</Text>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Réglages de l'application utilisateur.</Text>
        </View>
        <Pressable onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backText}>RETOUR</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <SettingRow label="Notifications" value="Actives" />
        <SettingRow label="Langue" value="Français" />
        <SettingRow label="Theme" value="Dark neon" />
        <SettingRow label="Confidentialité" value="Standard" />
      </View>
    </View>
  </SafeAreaView>
);

const SettingRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 29,
    fontWeight: '900',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },
  backButton: {
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rowValue: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
});

export default SettingsScreen;

