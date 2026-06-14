import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { AudioSaveStatus } from '../types';

type MicrophoneRecorderCardProps = {
  isRecording: boolean;
  onReplay: () => void;
  onSave: () => void;
  onToggleRecording: () => void;
  replayAvailable: boolean;
  saveStatus: AudioSaveStatus;
};

const statusLabels: Record<AudioSaveStatus, string> = {
  error: "L'enregistrement n'a pas pu être sauvegardé.",
  idle: 'Le son sera sauvegardé en base à la fin de l’enregistrement.',
  saved: 'Enregistrement sauvegardé dans la base de données.',
  saving: 'Sauvegarde en base de données...',
};

export const MicrophoneRecorderCard = ({
  isRecording,
  onReplay,
  onSave,
  onToggleRecording,
  replayAvailable,
  saveStatus,
}: MicrophoneRecorderCardProps) => {
  const recordingOpacity = useRef(new Animated.Value(1)).current;
  const canRetrySave = saveStatus === 'error' && replayAvailable;

  useEffect(() => {
    if (!isRecording) {
      recordingOpacity.stopAnimation();
      recordingOpacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(recordingOpacity, { duration: 500, toValue: 0.2, useNativeDriver: true }),
        Animated.timing(recordingOpacity, { duration: 500, toValue: 1, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [isRecording, recordingOpacity]);

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Animated.View
          style={[
            styles.recordingIndicator,
            !isRecording && styles.recordingIndicatorIdle,
            { opacity: recordingOpacity },
          ]}
        />
        <Text style={styles.heading}>ENREGISTREUR MICRO</Text>
      </View>
      <Text style={styles.status}>{isRecording ? 'Enregistrement en cours...' : statusLabels[saveStatus]}</Text>

      <Pressable
        accessibilityLabel={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
        accessibilityRole="button"
        disabled={saveStatus === 'saving'}
        onPress={canRetrySave ? onSave : onToggleRecording}
        style={[styles.recordButton, isRecording && styles.stopButton, saveStatus === 'saving' && styles.disabled]}
      >
        {saveStatus === 'saving' ? (
          <ActivityIndicator color={colors.danger} size="large" />
        ) : (
          <Animated.View
            style={[
              isRecording ? styles.stopIcon : styles.recordIcon,
              isRecording && { opacity: recordingOpacity },
            ]}
          />
        )}
      </Pressable>

      <Text style={[styles.actionLabel, isRecording && styles.stopLabel]}>
        {isRecording ? 'STOP' : canRetrySave ? 'RÉESSAYER L’ENVOI' : 'RECORD'}
      </Text>

      <Pressable
        disabled={!replayAvailable || isRecording || saveStatus === 'saving'}
        onPress={onReplay}
        style={[styles.replayButton, (!replayAvailable || isRecording || saveStatus === 'saving') && styles.disabled]}
      >
        <Text style={styles.replayText}>RÉÉCOUTER</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#09050D',
    borderColor: '#E85CFF66',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center' },
  recordingIndicator: { backgroundColor: colors.danger, borderRadius: 5, height: 9, width: 9 },
  recordingIndicatorIdle: { backgroundColor: colors.textMuted },
  heading: { color: colors.neonPurple, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  status: { color: colors.textSecondary, fontSize: 9, marginTop: 8, textAlign: 'center' },
  recordButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#12090D',
    borderColor: colors.danger,
    borderRadius: 48,
    borderWidth: 3,
    height: 96,
    justifyContent: 'center',
    marginTop: 16,
    width: 96,
  },
  stopButton: { backgroundColor: '#200A10' },
  recordIcon: { backgroundColor: colors.danger, borderRadius: 29, height: 58, width: 58 },
  stopIcon: { backgroundColor: colors.danger, borderRadius: 6, height: 46, width: 46 },
  actionLabel: { color: colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 8, textAlign: 'center' },
  stopLabel: { color: colors.textPrimary },
  replayButton: {
    alignItems: 'center',
    borderColor: colors.neonCyan,
    borderRadius: 11,
    borderWidth: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 30,
  },
  replayText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900' },
  disabled: { opacity: 0.4 },
});
