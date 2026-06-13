import React, { useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NeonButton } from '../../components/common/NeonButton';
import { NeonCard } from '../../components/common/NeonCard';
import { StatusPill } from '../../components/common/StatusPill';
import { useI18n } from '../../i18n/I18nProvider';
import type { CalibrationProfile } from '../../models/calibration';
import { useCalibrationStore } from '../../store/calibrationStore';
import { colors } from '../../theme/colors';

const getSensitivity = (profile: CalibrationProfile) => {
  if (profile.audioThreshold <= 42 || profile.gasThreshold <= 95) {
    return 'Haute';
  }

  if (profile.audioThreshold >= 65 || profile.gasThreshold >= 160) {
    return 'Faible';
  }

  return 'Normale';
};

const createDefaultProfile = (): CalibrationProfile => {
  const createdAt = new Date().toISOString();

  return {
    id: createdAt,
    name: `Nouveau profil ${new Date().toLocaleDateString()}`,
    createdAt,
    audioThreshold: 52,
    gasThreshold: 120,
    cooldownSeconds: 20,
    gasAnalysisWindowSeconds: 8,
    confidencePercent: 50,
    recommendedProfile: 'Équilibré',
  };
};

export const CalibrationProfilesScreen = () => {
  const { t } = useI18n();
  const profiles = useCalibrationStore((state) => state.profiles);
  const activeProfileId = useCalibrationStore((state) => state.activeProfileId);
  const applyProfile = useCalibrationStore((state) => state.applyProfile);
  const deleteProfile = useCalibrationStore((state) => state.deleteProfile);
  const duplicateProfile = useCalibrationStore((state) => state.duplicateProfile);
  const saveProfile = useCalibrationStore((state) => state.saveProfile);

  const confirmDelete = useCallback(
    (profile: CalibrationProfile) => {
      Alert.alert(
        'Supprimer le profil',
        `Voulez-vous supprimer « ${profile.name} » ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => deleteProfile(profile.id),
          },
        ],
      );
    },
    [deleteProfile],
  );

  const exportProfile = useCallback((profile: CalibrationProfile) => {
    Alert.alert(
      'Export JSON prêt',
      JSON.stringify({ exportedAt: new Date().toISOString(), profile }, null, 2),
    );
  }, []);

  const createProfile = useCallback(() => {
    const profile = createDefaultProfile();
    saveProfile(profile);
    Alert.alert('Profil créé', profile.name);
  }, [saveProfile]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.profiles')}</Text>
          </View>
          <StatusPill label={`${profiles.length} profils`} status="idle" />
        </View>

        <NeonButton
          label="Créer nouveau profil"
          onPress={createProfile}
          style={styles.createButton}
        />

        {profiles.length === 0 ? (
          <NeonCard accent="cyan" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucun profil sauvegardé</Text>
            <Text style={styles.emptyDescription}>
              Créez un profil ou sauvegardez les résultats d’une calibration.
            </Text>
          </NeonCard>
        ) : (
          profiles.map((profile) => {
            const isActive = profile.id === activeProfileId;

            return (
              <NeonCard
                accent={isActive ? 'green' : 'cyan'}
                key={profile.id}
                style={styles.profileCard}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileCopy}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.createdAt}>
                      Créé le {new Date(profile.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {isActive ? <StatusPill label="Actif" status="active" /> : null}
                </View>

                <View style={styles.metrics}>
                  <ProfileMetric
                    label="Sensibilité"
                    value={getSensitivity(profile)}
                  />
                  <ProfileMetric
                    label="Audio threshold"
                    value={`${profile.audioThreshold} dB`}
                  />
                  <ProfileMetric
                    label="Gas threshold"
                    value={`${profile.gasThreshold} kΩ`}
                  />
                </View>

                <View style={styles.actions}>
                  <NeonButton
                    disabled={isActive}
                    label={isActive ? 'Profil actif' : 'Appliquer'}
                    onPress={() => applyProfile(profile.id)}
                    style={styles.actionButton}
                  />
                  <NeonButton
                    label="Dupliquer"
                    onPress={() => duplicateProfile(profile.id)}
                    style={styles.actionButton}
                    variant="secondary"
                  />
                  <NeonButton
                    label="Exporter JSON"
                    onPress={() => exportProfile(profile)}
                    style={styles.actionButton}
                    variant="secondary"
                  />
                  <NeonButton
                    label="Supprimer"
                    onPress={() => confirmDelete(profile)}
                    style={styles.actionButton}
                    variant="secondary"
                  />
                </View>
              </NeonCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

type ProfileMetricProps = {
  label: string;
  value: string;
};

const ProfileMetric = ({ label, value }: ProfileMetricProps) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  createButton: { marginBottom: 16, minHeight: 54 },
  emptyCard: { alignItems: 'center', paddingVertical: 38 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  profileCard: { marginBottom: 14 },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileCopy: { flex: 1, marginRight: 12 },
  profileName: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  createdAt: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  metrics: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  metric: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    flex: 1,
    padding: 10,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.neonCyan,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { flex: 1, minWidth: '46%' },
});

export default CalibrationProfilesScreen;
