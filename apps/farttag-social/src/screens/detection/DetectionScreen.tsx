import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyProgressCard } from '../../features/detection/components/DailyProgressCard';
import { DetectionModeSwitch } from '../../features/detection/components/DetectionModeSwitch';
import { DetectionRadarCard } from '../../features/detection/components/DetectionRadarCard';
import { DeviceStatusCard } from '../../features/detection/components/DeviceStatusCard';
import { LastExploitCard } from '../../features/detection/components/LastExploitCard';
import { MicrophoneRecorderCard } from '../../features/detection/components/MicrophoneRecorderCard';
import { QuickHistoryCard } from '../../features/detection/components/QuickHistoryCard';
import { useDetectionStore } from '../../features/detection/detectionStore';
import type { DetectedFartEvent, DetectionSource } from '../../features/detection/types';
import { useHistoryStore } from '../../features/history/historyStore';
import type { FartHistoryEvent } from '../../features/history/types';
import type { DetectionStackParamList } from '../../navigation/types';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { colors } from '../../theme/colors';

const FALLBACK_EVENT: DetectedFartEvent = {
  audioLevel: 72.6,
  capturedAt: '2026-06-14T15:02:00.000Z',
  durationMs: 2_800,
  gasLevel: 98.4,
  id: 'fallback-detection',
  provisionalScore: 82,
  source: 'ble',
};

const FALLBACK_HISTORY: FartHistoryEvent[] = [
  { audioLevel: 72.6, audioReplayUrl: null, durationMs: 2_800, gasLevel: 98.4, id: 'fallback-history-1', isLegendary: false, occurredAt: '2026-06-14T15:02:00.000Z', officialScore: 82, visibility: 'private' },
  { audioLevel: 68.2, audioReplayUrl: null, durationMs: 2_100, gasLevel: 84.6, id: 'fallback-history-2', isLegendary: false, occurredAt: '2026-06-14T13:47:00.000Z', officialScore: 64, visibility: 'private' },
  { audioLevel: 55.1, audioReplayUrl: null, durationMs: 1_300, gasLevel: 60.2, id: 'fallback-history-3', isLegendary: false, occurredAt: '2026-06-14T11:23:00.000Z', officialScore: 49, visibility: 'private' },
];

const categoryForScore = (score: number) => score >= 92 ? 'Catégorie 5' : score >= 80 ? 'Catégorie 3' : 'Catégorie 2';
const funLabelForScore = (score: number) => score >= 92 ? 'Légendaire' : score >= 70 ? 'Gros et fier' : 'Assassin silencieux';

export const DetectionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<DetectionStackParamList>>();
  const bleStatus = useDetectionStore((state) => state.bleStatus);
  const audioSaveStatus = useDetectionStore((state) => state.audioSaveStatus);
  const device = useDetectionStore((state) => state.device);
  const error = useDetectionStore((state) => state.error);
  const inputMode = useDetectionStore((state) => state.inputMode);
  const isPhoneMicRecording = useDetectionStore((state) => state.isPhoneMicRecording);
  const lastEvent = useDetectionStore((state) => state.lastEvent);
  const officialResult = useDetectionStore((state) => state.officialResult);
  const uploadStatus = useDetectionStore((state) => state.uploadStatus);
  const connectDevice = useDetectionStore((state) => state.connectDevice);
  const simulateAutomaticEvent = useDetectionStore((state) => state.simulateAutomaticEvent);
  const saveLastAudio = useDetectionStore((state) => state.saveLastAudio);
  const startPhoneMicTest = useDetectionStore((state) => state.startPhoneMicTest);
  const stopPhoneMicTest = useDetectionStore((state) => state.stopPhoneMicTest);
  const uploadLastEvent = useDetectionStore((state) => state.uploadLastEvent);
  const historyEvents = useHistoryStore((state) => state.events);
  const historyHasLoaded = useHistoryStore((state) => state.hasLoaded);
  const loadHistory = useHistoryStore((state) => state.loadHistory);
  const [mode, setMode] = useState<DetectionSource>(inputMode);

  useEffect(() => {
    if (!historyHasLoaded) {
      void loadHistory();
    }
  }, [historyHasLoaded, loadHistory]);

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

  const displayedEvent = lastEvent ?? FALLBACK_EVENT;
  const quickHistory = useMemo(
    () => [...historyEvents, ...FALLBACK_HISTORY].filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index).slice(0, 3),
    [historyEvents],
  );
  const latestHistoryEvent = historyEvents[0] ?? null;
  const dailyProgress = historyEvents.length > 0 ? Math.min(historyEvents.length, 10) : 7;
  const flatulonsReward = officialResult?.flatulonsEarned ?? 15;
  const isListening = mode === 'phone-mic' ? isPhoneMicRecording : bleStatus === 'connected';
  const signalLabel = mode === 'phone-mic'
    ? isPhoneMicRecording ? 'MICRO EN ÉCOUTE' : 'MICRO BÊTA PRÊT'
    : bleStatus === 'connected' ? 'SIGNAL EXCELLENT' : 'SIGNAL FAIBLE';

  const toggleMicrophone = () => {
    void (isPhoneMicRecording ? stopPhoneMicTest() : startPhoneMicTest());
  };

  const replayLastEvent = async () => {
    if (displayedEvent.audioUri) {
      PhoneMicService.play(displayedEvent.audioUri);
      return;
    }
    if (!latestHistoryEvent?.audioReplayUrl) {
      return;
    }
    try {
      await Linking.openURL(latestHistoryEvent.audioReplayUrl);
    } catch {
      Alert.alert('Replay indisponible', "L'audio n'a pas pu être ouvert.");
    }
  };

  const openDetails = (eventId: string) => {
    navigation.navigate('FartDetailsScreen', { fartEventId: eventId });
  };

  const openDeviceStatus = () => {
    if (mode === 'ble' && bleStatus !== 'connected') {
      void connectDevice();
      return;
    }
    Alert.alert(
      mode === 'phone-mic' ? 'Mode micro bêta' : device?.name ?? 'FartTag',
      mode === 'phone-mic'
        ? 'Le téléphone capture uniquement le signal audio, sans mesure du capteur gaz.'
        : `${device?.batteryLevel ?? 0}% batterie · ${device?.rssi ?? 0} dBm`,
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleLine}>
            <View style={styles.lineStem} />
            <View style={styles.lineDot} />
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleGreen}>CENTRE </Text>
            <Text style={styles.titleCyan}>DE </Text>
            <Text style={styles.titlePurple}>DÉTECTION</Text>
          </Text>
          <View style={[styles.titleLine, styles.titleLineRight]}>
            <View style={[styles.lineStem, styles.lineStemPurple]} />
            <View style={[styles.lineDot, styles.lineDotPurple]} />
          </View>
        </View>
        <Text style={styles.subtitle}>Choisis ton mode de détection</Text>

        <DetectionModeSwitch
          bleStatus={bleStatus}
          device={device}
          isPhoneMicRecording={isPhoneMicRecording}
          mode={mode}
          onConnect={() => void connectDevice()}
          onModeChange={setMode}
        />
        {mode === 'phone-mic' ? (
          <MicrophoneRecorderCard
            isRecording={isPhoneMicRecording}
            onReplay={() => void replayLastEvent()}
            onSave={() => void saveLastAudio()}
            onToggleRecording={toggleMicrophone}
            replayAvailable={Boolean(lastEvent?.audioUri)}
            saveStatus={audioSaveStatus}
          />
        ) : null}
        <DetectionRadarCard event={displayedEvent} isListening={isListening} mode={mode} signalLabel={signalLabel} />
        <LastExploitCard
          category={categoryForScore(displayedEvent.provisionalScore)}
          event={displayedEvent}
          flatulonsReward={flatulonsReward}
          funLabel={funLabelForScore(displayedEvent.provisionalScore)}
          onOpenDetails={() => openDetails(latestHistoryEvent?.id ?? displayedEvent.id)}
          onReplay={() => void replayLastEvent()}
          onUpload={() => void uploadLastEvent()}
          replayAvailable={Boolean(displayedEvent.audioUri || latestHistoryEvent?.audioReplayUrl)}
          uploadStatus={uploadStatus}
        />

        <View style={styles.secondaryGrid}>
          <QuickHistoryCard
            events={quickHistory}
            onOpen={(event) => openDetails(event.id)}
            onSeeAll={() => Alert.alert('Historique complet', 'Retrouve tout ton historique dans ton profil.')}
          />
          <DailyProgressCard goal={10} progress={dailyProgress} reward={25} />
        </View>

        <DeviceStatusCard device={device} mode={mode} onPress={openDeviceStatus} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 1 },
  titleLine: { alignItems: 'center', flexDirection: 'row', width: 29 },
  titleLineRight: { flexDirection: 'row-reverse' },
  lineStem: { backgroundColor: colors.neonGreen, height: 1, opacity: 0.55, width: 22 },
  lineStemPurple: { backgroundColor: colors.neonPurple },
  lineDot: { borderColor: colors.neonGreen, borderRadius: 3, borderWidth: 1, height: 5, width: 5 },
  lineDotPurple: { borderColor: colors.neonPurple },
  title: { fontSize: 17, fontWeight: '900', letterSpacing: 0.3, textAlign: 'center' },
  titleGreen: { color: colors.neonGreen },
  titleCyan: { color: colors.neonCyan },
  titlePurple: { color: colors.neonPurple },
  subtitle: { color: colors.textSecondary, fontSize: 9, marginBottom: 12, marginTop: 3, textAlign: 'center' },
  secondaryGrid: { flexDirection: 'row', gap: 10 },
  error: { color: colors.danger, fontSize: 10, marginTop: 14, textAlign: 'center' },
});

export default DetectionScreen;
