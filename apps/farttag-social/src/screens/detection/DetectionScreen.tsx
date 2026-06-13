import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DetectionMetric } from '../../features/detection/components/DetectionMetric';
import { useDetectionStore } from '../../features/detection/detectionStore';
import { colors } from '../../theme/colors';

const bleLabels = {
  connected: 'BLE CONNECTÉ',
  connecting: 'CONNEXION...',
  disconnected: 'BLE DÉCONNECTÉ',
};

const uploadLabels = {
  error: 'ÉCHEC UPLOAD',
  idle: 'NON ENVOYÉ',
  pending: 'ENVOI...',
  uploaded: 'VALIDÉ BACKEND',
};

export const DetectionScreen = () => {
  const [showDetails, setShowDetails] = useState(false);
  const bleStatus = useDetectionStore((state) => state.bleStatus);
  const device = useDetectionStore((state) => state.device);
  const error = useDetectionStore((state) => state.error);
  const inputMode = useDetectionStore((state) => state.inputMode);
  const isPhoneMicRecording = useDetectionStore((state) => state.isPhoneMicRecording);
  const lastEvent = useDetectionStore((state) => state.lastEvent);
  const officialResult = useDetectionStore((state) => state.officialResult);
  const uploadStatus = useDetectionStore((state) => state.uploadStatus);
  const connectDevice = useDetectionStore((state) => state.connectDevice);
  const simulateAutomaticEvent = useDetectionStore((state) => state.simulateAutomaticEvent);
  const startPhoneMicTest = useDetectionStore((state) => state.startPhoneMicTest);
  const stopPhoneMicTest = useDetectionStore((state) => state.stopPhoneMicTest);
  const uploadLastEvent = useDetectionStore((state) => state.uploadLastEvent);

  useEffect(() => {
    if (bleStatus !== 'connected') {
      return;
    }

    const firstEvent = setTimeout(simulateAutomaticEvent, 1_800);
    const stream = setInterval(simulateAutomaticEvent, 15_000);
    return () => {
      clearTimeout(firstEvent);
      clearInterval(stream);
    };
  }, [bleStatus, simulateAutomaticEvent]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>FARTTAG SOCIAL</Text>
            <Text style={styles.title}>Détection</Text>
            <Text style={styles.subtitle}>Écoute automatique du FartTag connecté.</Text>
          </View>
        </View>

        <View style={[styles.card, styles.deviceCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>DEVICE</Text>
              <Text style={styles.deviceName}>{device?.name ?? 'Aucun FartTag connecté'}</Text>
            </View>
            <View style={[styles.statusPill, bleStatus === 'connected' && styles.statusPillActive]}>
              <View style={[styles.statusDot, bleStatus === 'connected' && styles.statusDotActive]} />
              <Text style={[styles.statusText, bleStatus === 'connected' && styles.statusTextActive]}>
                {bleLabels[bleStatus]}
              </Text>
            </View>
          </View>

          {device ? (
            <Text style={styles.deviceMeta}>
              {device.id} · {device.batteryLevel}% BAT · {device.rssi} dBm
            </Text>
          ) : (
            <Pressable
              disabled={bleStatus === 'connecting'}
              onPress={() => void connectDevice()}
              style={styles.primaryButton}
            >
              {bleStatus === 'connecting' ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>CONNECTER DEVICE</Text>
              )}
            </Pressable>
          )}

          <View style={styles.phoneMicBlock}>
            <Text style={styles.phoneMicCaption}>MODE TEST TEMPORAIRE</Text>
            <Text style={styles.phoneMicDescriptionInline}>
              Enregistre avec le micro du téléphone et passe par la même interception que le BLE.
            </Text>
            <Pressable
              onPress={() => void (isPhoneMicRecording ? stopPhoneMicTest() : startPhoneMicTest())}
              style={[
                styles.secondaryButton,
                styles.phoneMicButtonInline,
                isPhoneMicRecording && styles.phoneMicRecordingButton,
              ]}
            >
              {isPhoneMicRecording ? (
                <ActivityIndicator color={colors.neonCyan} size="small" />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  ENREGISTRER AVEC LE MICRO
                </Text>
              )}
            </Pressable>
            <Text style={styles.phoneMicHint}>
              {isPhoneMicRecording
                ? 'Enregistrement en cours. Clique à nouveau pour arrêter et récupérer le son.'
                : 'Mode test temporaire, pour enregistrer avec le micro du téléphone.'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.eventCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>DERNIER ÉVÉNEMENT</Text>
              <Text style={styles.eventTitle}>
                {lastEvent ? 'Fart détecté automatiquement' : 'En attente de détection'}
              </Text>
            </View>
            <View style={styles.pulse}>
              <View style={styles.pulseCore} />
            </View>
          </View>

          {lastEvent ? (
            <>
              <View style={styles.metrics}>
                <DetectionMetric accent="cyan" label="Audio" value={`${lastEvent.audioLevel.toFixed(1)} dB`} />
                <DetectionMetric accent="green" label="Gaz" value={`${lastEvent.gasLevel.toFixed(1)} kΩ`} />
                <DetectionMetric accent="purple" label="Score provisoire" value={`${lastEvent.provisionalScore}`} />
                <DetectionMetric label="Durée" value={`${(lastEvent.durationMs / 1_000).toFixed(1)} s`} />
              </View>

              <View style={styles.uploadRow}>
                <View>
                  <Text style={styles.uploadLabel}>STATUT UPLOAD</Text>
                  <Text style={styles.uploadValue}>{uploadLabels[uploadStatus]}</Text>
                </View>
                <Pressable
                  disabled={uploadStatus === 'pending'}
                  onPress={() => void uploadLastEvent()}
                  style={styles.uploadButton}
                >
                  {uploadStatus === 'pending' ? (
                    <ActivityIndicator color={colors.neonCyan} size="small" />
                  ) : (
                    <Text style={styles.uploadButtonText}>ENVOYER AU BACKEND</Text>
                  )}
                </Pressable>
              </View>

              <Pressable onPress={() => setShowDetails((visible) => !visible)} style={styles.detailButton}>
                <Text style={styles.detailButtonText}>
                  {showDetails ? 'MASQUER LE DÉTAIL' : 'VOIR DÉTAIL DU DERNIER FART'}
                </Text>
              </Pressable>

              {showDetails ? (
                <View style={styles.details}>
                  <DetailRow label="ID local" value={lastEvent.id} />
                  <DetailRow label="Capture" value={new Date(lastEvent.capturedAt).toLocaleString()} />
                  <DetailRow
                    label="Origine"
                    value={inputMode === 'phone-mic' ? 'Micro du téléphone (test)' : 'Détection automatique BLE'}
                  />
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.waitingText}>
              La détection démarre automatiquement dès que le device est connecté. Aucune action utilisateur n'est requise.
            </Text>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.card, styles.officialCard]}>
          <Text style={styles.sectionEyebrow}>RÉSULTAT OFFICIEL BACKEND</Text>
          {officialResult ? (
            <>
              <View style={styles.officialScoreRow}>
                <View>
                  <Text style={styles.officialLabel}>SCORE OFFICIEL</Text>
                  <Text style={styles.officialScore}>{officialResult.officialScore}</Text>
                </View>
                <View style={styles.flatulons}>
                  <Text style={styles.flatulonsValue}>+{officialResult.flatulonsEarned}</Text>
                  <Text style={styles.flatulonsLabel}>FLATULONS</Text>
                </View>
              </View>
              <Text style={styles.rewardText}>
                Badges débloqués : {officialResult.unlockedBadges.length > 0
                  ? officialResult.unlockedBadges.map((badge) => badge.name).join(', ')
                  : 'aucun'}
              </Text>
              <Text style={styles.rewardText}>
                Classement : {officialResult.ranking
                  ? `#${officialResult.ranking.position} · ${officialResult.ranking.scope}`
                  : 'non classé'}
              </Text>
            </>
          ) : (
            <Text style={styles.waitingText}>
              Le backend attribuera le score officiel, les Flatulons, badges et classement après l'envoi.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text numberOfLines={1} style={styles.detailValue}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  eyebrow: { color: colors.neonGreen, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: colors.textPrimary, fontSize: 29, fontWeight: '800', marginTop: 3 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 5 },
  card: { backgroundColor: colors.surface, borderRadius: 21, borderWidth: 1, marginBottom: 16, padding: 16 },
  deviceCard: { borderColor: colors.neonCyan },
  eventCard: { borderColor: colors.neonPurple },
  officialCard: { borderColor: colors.neonGreen },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionEyebrow: { color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  deviceName: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginTop: 5 },
  deviceMeta: { color: colors.textSecondary, fontSize: 10, marginTop: 12 },
  statusPill: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  statusPillActive: { borderColor: colors.neonGreen },
  statusDot: { backgroundColor: colors.textMuted, borderRadius: 4, height: 6, width: 6 },
  statusDotActive: { backgroundColor: colors.neonGreen },
  statusText: { color: colors.textMuted, fontSize: 7, fontWeight: '900' },
  statusTextActive: { color: colors.neonGreen },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.neonGreen,
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 46,
  },
  primaryButtonText: { color: colors.background, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  secondaryButtonText: { color: colors.neonCyan, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  phoneMicRecordingButton: { borderColor: colors.neonPurple, shadowColor: colors.neonPurple },
  phoneMicBlock: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  phoneMicCaption: { color: colors.neonPurple, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  phoneMicDescriptionInline: { color: colors.textSecondary, fontSize: 10, lineHeight: 16, marginTop: 6 },
  phoneMicButtonInline: { marginTop: 12 },
  phoneMicHint: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  eventTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 5 },
  pulse: {
    alignItems: 'center',
    borderColor: colors.neonPurple,
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pulseCore: { backgroundColor: colors.neonPurple, borderRadius: 5, height: 9, width: 9 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 16 },
  uploadRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
  },
  uploadLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  uploadValue: { color: colors.neonCyan, fontSize: 11, fontWeight: '900', marginTop: 4 },
  uploadButton: { borderColor: colors.neonCyan, borderRadius: 12, borderWidth: 1, minWidth: 140, paddingHorizontal: 12, paddingVertical: 10 },
  uploadButtonText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  detailButton: { borderColor: colors.neonPurple, borderRadius: 12, borderWidth: 1, marginTop: 12, paddingVertical: 11 },
  detailButtonText: { color: colors.neonPurple, fontSize: 9, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center' },
  details: { backgroundColor: colors.surfaceElevated, borderRadius: 13, marginTop: 10, padding: 12 },
  detailRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  detailValue: { color: colors.textSecondary, flex: 1, fontSize: 9, textAlign: 'right' },
  waitingText: { color: colors.textSecondary, fontSize: 11, lineHeight: 18, marginTop: 14 },
  error: { color: colors.danger, fontSize: 11, marginBottom: 16, textAlign: 'center' },
  officialScoreRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  officialLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  officialScore: { color: colors.neonGreen, fontSize: 40, fontWeight: '900', marginTop: 2 },
  flatulons: { alignItems: 'flex-end' },
  flatulonsValue: { color: colors.neonPurple, fontSize: 25, fontWeight: '900' },
  flatulonsLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  rewardText: { color: colors.textSecondary, fontSize: 11, marginTop: 9 },
});

export default DetectionScreen;
