import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useNotificationStore } from '../../../features/notifications/notificationStore';
import type { NotificationPreferences } from '../../../services/notifications/NotificationService';
import { SurfaceCard } from '../../../shared/components';
import { colors } from '../../../theme/colors';

const preferenceRows: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'socialEnabled', label: 'Notifications sociales', description: 'Demandes, réactions et commentaires' },
  { key: 'rewardsEnabled', label: 'Récompenses', description: 'Badges, objets et Flatulons' },
  { key: 'challengesEnabled', label: 'Défis', description: 'Défis reçus et résultats' },
  { key: 'dailyReminderEnabled', label: 'Rappels quotidiens', description: 'Coffre quotidien et classement' },
];

export const ProfileSettingsTab = () => {
  const error = useNotificationStore((state) => state.error);
  const isRegistering = useNotificationStore((state) => state.isRegistering);
  const permissionStatus = useNotificationStore((state) => state.permissionStatus);
  const preferences = useNotificationStore((state) => state.preferences);
  const initializeNotifications = useNotificationStore((state) => state.initializeNotifications);
  const registerToken = useNotificationStore((state) => state.registerToken);
  const sendLocalTestNotification = useNotificationStore((state) => state.sendLocalTestNotification);
  const updatePreference = useNotificationStore((state) => state.updatePreference);

  useEffect(() => {
    void initializeNotifications();
  }, [initializeNotifications]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.safeArea}>
      <Text style={styles.heading}>NOTIFICATIONS</Text>
      <Text style={styles.subtitle}>Choisis ce qui mérite de faire vibrer ton téléphone.</Text>

      <SurfaceCard accent="cyan" style={styles.card}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, permissionStatus === 'granted' && styles.statusDotActive]} />
          <View style={styles.copy}>
            <Text style={styles.label}>Permission système</Text>
            <Text style={styles.description}>{permissionStatus === 'granted' ? 'Notifications activées' : 'Autorisation nécessaire'}</Text>
          </View>
          <Text style={styles.status}>{permissionStatus.toUpperCase()}</Text>
        </View>
        <ActionButton
          label={permissionStatus === 'granted' ? 'RÉENREGISTRER LE TOKEN PUSH' : 'ACTIVER LES NOTIFICATIONS'}
          loading={isRegistering}
          onPress={() => void registerToken()}
        />
        <ActionButton label="ENVOYER UNE NOTIFICATION TEST" onPress={() => void sendLocalTestNotification()} tone="purple" />
      </SurfaceCard>

      <SurfaceCard style={styles.card}>
        {preferenceRows.map((row) => (
          <View key={row.key} style={styles.preferenceRow}>
            <View style={styles.copy}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.description}>{row.description}</Text>
            </View>
            <Switch
              onValueChange={(enabled) => void updatePreference(row.key, enabled)}
              thumbColor={preferences[row.key] ? colors.neonGreen : colors.textMuted}
              trackColor={{ false: colors.border, true: '#9CFF0044' }}
              value={preferences[row.key]}
            />
          </View>
        ))}
      </SurfaceCard>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
};

const ActionButton = ({ label, loading = false, onPress, tone = 'green' }: { label: string; loading?: boolean; onPress: () => void; tone?: 'green' | 'purple' }) => {
  const accent = tone === 'green' ? colors.neonGreen : colors.neonPurple;
  return (
    <Pressable disabled={loading} onPress={onPress} style={[styles.action, { borderColor: accent }]}>
      {loading ? <ActivityIndicator color={accent} size="small" /> : <Text style={[styles.actionText, { color: accent }]}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  heading: { color: colors.neonGreen, fontSize: 17, fontWeight: '900', letterSpacing: 1.2 },
  subtitle: { color: colors.textSecondary, fontSize: 10, marginBottom: 16, marginTop: 5 },
  card: { gap: 12, marginBottom: 14 },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  statusDot: { backgroundColor: colors.danger, borderRadius: 6, height: 10, width: 10 },
  statusDotActive: { backgroundColor: colors.neonGreen, shadowColor: colors.neonGreen, shadowOpacity: 0.9, shadowRadius: 7 },
  copy: { flex: 1 },
  label: { color: colors.textPrimary, fontSize: 11, fontWeight: '900' },
  description: { color: colors.textSecondary, fontSize: 8, marginTop: 3 },
  status: { color: colors.neonCyan, fontSize: 8, fontWeight: '900' },
  action: { alignItems: 'center', borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 42 },
  actionText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  preferenceRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 7 },
  error: { color: colors.danger, fontSize: 10, textAlign: 'center' },
});

export default ProfileSettingsTab;
