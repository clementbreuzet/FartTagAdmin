import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DetectionModeSwitch } from '../../features/detection/components/DetectionModeSwitch';
import { DetectionRadarCard } from '../../features/detection/components/DetectionRadarCard';
import { DeviceStatusCard } from '../../features/detection/components/DeviceStatusCard';
import { LastExploitCard } from '../../features/detection/components/LastExploitCard';
import { MicrophoneRecorderCard } from '../../features/detection/components/MicrophoneRecorderCard';
import { useDetectionStore } from '../../features/detection/detectionStore';
import type { DetectedFartEvent, DetectionSource } from '../../features/detection/types';
import type { DetectionStackParamList } from '../../navigation/types';
import { PhoneMicService } from '../../services/audio/PhoneMicService';
import { ScreenTitle } from '../../shared/components';
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
  const [mode, setMode] = useState<DetectionSource>(inputMode);

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
    Alert.alert('Replay indisponible', "Aucun audio local n'est disponible pour le dernier pet détecté.");
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
        <ScreenTitle title="CENTRE DE DÉTECTION" />
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
          onOpenDetails={() => openDetails(displayedEvent.id)}
          onReplay={() => void replayLastEvent()}
          onUpload={() => void uploadLastEvent()}
          replayAvailable={Boolean(displayedEvent.audioUri)}
          uploadStatus={uploadStatus}
        />

        <DeviceStatusCard device={device} mode={mode} onPress={openDeviceStatus} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  subtitle: { color: colors.textSecondary, fontSize: 9, marginBottom: 12, marginTop: 3, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 10, marginTop: 14, textAlign: 'center' },
});

export default DetectionScreen;
