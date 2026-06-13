import React, { useCallback, useEffect, useState } from 'react';
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
import { useDeviceStore } from '../../store/deviceStore';
import { colors } from '../../theme/colors';

const INITIAL_VERSION = '2.8.4';
const LATEST_VERSION = '2.9.0';
const PREVIOUS_VERSION = '2.8.3';
const BUILD_DATE = '10 juin 2026';
const FIRMWARE_SIZE_MB = 1.84;

const changelog = {
  newFeatures: [
    'Nouveau pipeline de détection gaz/audio synchronisé.',
    'Diagnostic BLE enrichi depuis l’application admin.',
  ],
  corrections: [
    'Correction des pertes de trames après une longue veille.',
    'Stabilisation de la lecture batterie sous forte charge.',
  ],
  improvements: [
    'Réduction de la consommation énergétique de 8%.',
    'Temps de reconnexion BLE amélioré.',
  ],
};

export const FirmwareScreen = () => {
  const { t } = useI18n();
  const connectedDevice = useDeviceStore((state) => state.connectedDevice);
  const [currentVersion, setCurrentVersion] = useState(
    connectedDevice?.firmwareVersion ?? INITIAL_VERSION,
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [installationProgress, setInstallationProgress] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const isConnected = connectedDevice !== null;
  const hasUpdate = currentVersion !== LATEST_VERSION;

  useEffect(() => {
    if (!isInstalling) {
      return;
    }

    const timer = setInterval(() => {
      setInstallationProgress((progress) => Math.min(100, progress + 5));
    }, 180);

    return () => clearInterval(timer);
  }, [isInstalling]);

  useEffect(() => {
    if (!isInstalling || installationProgress < 100) {
      return;
    }

    setIsInstalling(false);
    setIsDownloaded(false);
    setCurrentVersion(LATEST_VERSION);
    Alert.alert(
      'Installation terminée',
      `Le FartTag utilise maintenant le firmware ${LATEST_VERSION}.`,
    );
  }, [installationProgress, isInstalling]);

  const checkForUpdates = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      Alert.alert(
        hasUpdate ? 'Mise à jour disponible' : 'Firmware à jour',
        hasUpdate
          ? `La version ${LATEST_VERSION} est prête à être téléchargée.`
          : `La version ${currentVersion} est la plus récente.`,
      );
    }, 700);
  }, [currentVersion, hasUpdate]);

  const downloadFirmware = useCallback(() => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
      Alert.alert(
        'Firmware téléchargé',
        `${LATEST_VERSION} est prêt pour l’installation mockée.`,
      );
    }, 1_000);
  }, []);

  const startInstallation = useCallback(() => {
    Alert.alert(
      'Installer le firmware',
      `Installer ${LATEST_VERSION} sur le FartTag ? Ne déconnectez pas l’appareil pendant l’opération.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Installer',
          onPress: () => {
            setInstallationProgress(0);
            setIsInstalling(true);
          },
        },
      ],
    );
  }, []);

  const rollback = useCallback(() => {
    Alert.alert(
      'Rollback firmware',
      `Revenir à la version ${PREVIOUS_VERSION} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rollback',
          style: 'destructive',
          onPress: () => {
            setCurrentVersion(PREVIOUS_VERSION);
            setIsDownloaded(false);
            Alert.alert(
              'Rollback terminé',
              `Le firmware ${PREVIOUS_VERSION} est maintenant actif.`,
            );
          },
        },
      ],
    );
  }, []);

  const restartDevice = useCallback(() => {
    Alert.alert(
      'Redémarrage simulé',
      'Le FartTag redémarre. La connexion BLE sera rétablie automatiquement.',
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('app.admin')}</Text>
            <Text style={styles.title}>{t('screen.firmware')}</Text>
          </View>
          <StatusPill
            label={isConnected ? 'Appareil connecté' : 'Appareil hors ligne'}
            status={isConnected ? 'active' : 'error'}
          />
        </View>

        <NeonCard accent={hasUpdate ? 'purple' : 'green'} style={styles.versionCard}>
          <View style={styles.versionHeader}>
            <View style={styles.versionColumn}>
              <Text style={styles.versionLabel}>Version actuelle</Text>
              <Text style={styles.currentVersion}>{currentVersion}</Text>
            </View>
            <View style={styles.versionArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
            <View style={styles.versionColumn}>
              <Text style={styles.versionLabel}>Dernière version</Text>
              <Text style={styles.latestVersion}>{LATEST_VERSION}</Text>
            </View>
          </View>
          <View style={styles.releaseMeta}>
            <Meta label="Date de build" value={BUILD_DATE} />
            <Meta label="Taille" value={`${FIRMWARE_SIZE_MB} MB`} />
            <Meta
              label="Statut"
              value={hasUpdate ? 'Mise à jour disponible' : 'À jour'}
            />
          </View>
        </NeonCard>

        {isInstalling ? (
          <NeonCard accent="green" style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Installation en cours</Text>
              <Text style={styles.progressValue}>{installationProgress}%</Text>
            </View>
            <Text style={styles.progressDescription}>
              Écriture du firmware sur la partition OTA mockée.
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${installationProgress}%` },
                ]}
              />
            </View>
          </NeonCard>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Changelog {LATEST_VERSION}</Text>
          <StatusPill label="Stable" status="active" />
        </View>

        <NeonCard accent="cyan" style={styles.changelogCard}>
          <ChangeGroup title="Nouveautés" items={changelog.newFeatures} />
          <ChangeGroup title="Corrections" items={changelog.corrections} />
          <ChangeGroup title="Améliorations" items={changelog.improvements} />
        </NeonCard>

        <NeonCard accent="purple">
          <Text style={styles.actionTitle}>Gestion OTA mock</Text>
          <Text style={styles.actionDescription}>
            Toutes les opérations sont simulées localement. Aucune écriture
            réelle n’est envoyée à l’ESP32.
          </Text>
          <View style={styles.actions}>
            <NeonButton
              disabled={isInstalling}
              label="Vérifier les mises à jour"
              loading={isChecking}
              onPress={checkForUpdates}
              style={styles.actionButton}
            />
            <NeonButton
              disabled={!hasUpdate || isInstalling}
              label={isDownloaded ? 'Firmware téléchargé' : 'Télécharger firmware'}
              loading={isDownloading}
              onPress={downloadFirmware}
              style={styles.actionButton}
              variant="secondary"
            />
            <NeonButton
              disabled={!isConnected || !isDownloaded || isInstalling}
              label="Installer firmware"
              onPress={startInstallation}
              style={styles.actionButton}
            />
            <NeonButton
              disabled={!isConnected || isInstalling}
              label="Rollback"
              onPress={rollback}
              style={styles.actionButton}
              variant="secondary"
            />
            <NeonButton
              disabled={!isConnected || isInstalling}
              label="Redémarrer appareil"
              onPress={restartDevice}
              style={styles.fullButton}
              variant="secondary"
            />
          </View>
        </NeonCard>
      </ScrollView>
    </SafeAreaView>
  );
};

type MetaProps = {
  label: string;
  value: string;
};

const Meta = ({ label, value }: MetaProps) => (
  <View style={styles.meta}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

type ChangeGroupProps = {
  title: string;
  items: string[];
};

const ChangeGroup = ({ title, items }: ChangeGroupProps) => (
  <View style={styles.changeGroup}>
    <Text style={styles.changeTitle}>{title}</Text>
    {items.map((item) => (
      <View key={item} style={styles.changeRow}>
        <View style={styles.changeDot} />
        <Text style={styles.changeText}>{item}</Text>
      </View>
    ))}
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
  headerCopy: { flex: 1, marginRight: 12 },
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
  versionCard: { marginBottom: 16 },
  versionHeader: { alignItems: 'center', flexDirection: 'row' },
  versionColumn: { flex: 1 },
  versionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  currentVersion: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 6,
  },
  latestVersion: {
    color: colors.neonGreen,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 6,
  },
  versionArrow: { paddingHorizontal: 8 },
  arrowText: { color: colors.neonPurple, fontSize: 24, fontWeight: '800' },
  releaseMeta: { flexDirection: 'row', gap: 8, marginTop: 18 },
  meta: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 9,
    flex: 1,
    padding: 9,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
  },
  progressCard: { marginBottom: 16 },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: colors.neonGreen,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  progressValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  progressDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 7,
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 7,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.neonGreen,
    borderRadius: 4,
    height: '100%',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  changelogCard: { marginBottom: 16 },
  changeGroup: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: 14,
    paddingBottom: 10,
  },
  changeTitle: {
    color: colors.neonCyan,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  changeRow: { flexDirection: 'row', marginBottom: 7 },
  changeDot: {
    backgroundColor: colors.neonGreen,
    borderRadius: 3,
    height: 6,
    marginRight: 9,
    marginTop: 6,
    width: 6,
  },
  changeText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  actionTitle: {
    color: colors.neonPurple,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 16,
    marginTop: 7,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: { flex: 1, minWidth: '46%' },
  fullButton: { width: '100%' },
});

export default FirmwareScreen;
