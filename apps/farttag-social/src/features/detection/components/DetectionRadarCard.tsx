import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { DetectedFartEvent, DetectionSource } from '../types';

type DetectionRadarCardProps = {
  event: DetectedFartEvent | null;
  isListening: boolean;
  mode: DetectionSource;
  signalLabel: string;
};

const fartLogo = require('../../../assets/branding/logo-app.png');
const gasLogo = require('../../../assets/detection/gaz.png');
const waveLogo = require('../../../assets/detection/wave.png');

export const DetectionRadarCard = ({
  event,
  isListening,
  mode,
  signalLabel,
}: DetectionRadarCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardGlow} />
    <Text style={styles.title}>CHASSE AU PET</Text>
    <Text style={styles.subtitle}>Prêt à détecter un exploit légendaire...</Text>

    <View style={styles.listeningRow}>
      <View style={[styles.listeningDot, !isListening && styles.listeningDotIdle]} />
      <Text style={[styles.listeningText, !isListening && styles.listeningTextIdle]}>
        {isListening ? 'EN ÉCOUTE' : 'EN ATTENTE'}
      </Text>
    </View>

    <View style={styles.radar}>
      <View style={[styles.radarRing, styles.radarRingOuter]} />
      <View style={[styles.radarRing, styles.radarRingMiddle]} />
      <View style={styles.crossHorizontal} />
      <View style={styles.crossVertical} />

      <View style={[styles.metric, styles.audioMetric]}>
        <View style={styles.metricIconFrame}>
          <Image source={waveLogo} style={styles.metricIcon} />
        </View>
        <Text style={[styles.metricLabel, styles.audioText]}>AUDIO</Text>
        <Text style={styles.metricValue}>{event ? event.audioLevel.toFixed(1) : '--'} <Text style={styles.metricUnit}>dB</Text></Text>
      </View>

      <View style={styles.logoHalo}>
        <Image source={fartLogo} style={styles.logo} />
      </View>

      <View style={[styles.metric, styles.gasMetric]}>
        <View style={styles.metricIconFrame}>
          <Image source={gasLogo} style={styles.metricIcon} />
        </View>
        <Text style={[styles.metricLabel, styles.gasText]}>GAZ</Text>
        <Text style={styles.metricValue}>{event ? event.gasLevel.toFixed(1) : '--'} <Text style={styles.metricUnit}>kΩ</Text></Text>
      </View>
    </View>

    <View style={[styles.signalPill, mode === 'phone-mic' && styles.microSignalPill]}>
      <View style={[styles.signalBars, mode === 'phone-mic' && styles.microSignalBars]} />
      <Text style={[styles.signalText, mode === 'phone-mic' && styles.microSignalText]}>{signalLabel}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#020706',
    borderColor: '#00E5FF55',
    borderRadius: 25,
    borderWidth: 1,
    elevation: 6,
    marginBottom: 18,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingTop: 20,
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  cardGlow: {
    backgroundColor: '#9CFF0009',
    borderRadius: 180,
    height: 310,
    position: 'absolute',
    top: 82,
    width: 310,
  },
  title: {
    color: colors.neonGreen,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },
  listeningRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  listeningDot: {
    backgroundColor: colors.neonGreen,
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  listeningDotIdle: {
    backgroundColor: colors.textMuted,
  },
  listeningText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  listeningTextIdle: {
    color: colors.textMuted,
  },
  radar: {
    alignItems: 'center',
    height: 280,
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  radarRing: {
    borderColor: '#9CFF0035',
    borderRadius: 180,
    borderWidth: 1,
    position: 'absolute',
  },
  radarRingOuter: {
    height: 270,
    width: 270,
  },
  radarRingMiddle: {
    borderColor: '#00E5FF20',
    height: 210,
    width: 210,
  },
  crossHorizontal: {
    backgroundColor: '#9CFF0028',
    height: 1,
    position: 'absolute',
    width: '92%',
  },
  crossVertical: {
    backgroundColor: '#9CFF0028',
    height: 245,
    position: 'absolute',
    width: 1,
  },
  logoHalo: {
    alignItems: 'center',
    borderColor: '#9CFF0055',
    borderRadius: 88,
    borderWidth: 1,
    elevation: 12,
    height: 176,
    justifyContent: 'center',
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    width: 176,
  },
  logo: {
    height: 158,
    resizeMode: 'contain',
    width: 158,
  },
  metric: {
    alignItems: 'center',
    position: 'absolute',
    top: 105,
    width: 76,
    zIndex: 2,
  },
  audioMetric: {
    left: 0,
  },
  gasMetric: {
    right: 0,
  },
  metricIconFrame: {
    borderRadius: 20,
    height: 40,
    overflow: 'hidden',
    width: 40,
  },
  metricIcon: {
    height: 72,
    left: -16,
    position: 'absolute',
    resizeMode: 'cover',
    top: -16,
    width: 72,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginTop: 5,
  },
  audioText: {
    color: colors.neonCyan,
  },
  gasText: {
    color: colors.neonGreen,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  metricUnit: {
    color: colors.textSecondary,
    fontSize: 8,
  },
  signalPill: {
    alignItems: 'center',
    borderColor: colors.neonGreen,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginBottom: 18,
    marginTop: -8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  microSignalPill: {
    borderColor: colors.neonPurple,
  },
  signalBars: {
    backgroundColor: colors.neonGreen,
    borderRadius: 3,
    height: 7,
    width: 7,
  },
  microSignalBars: {
    backgroundColor: colors.neonPurple,
  },
  signalText: {
    color: colors.neonGreen,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  microSignalText: {
    color: colors.neonPurple,
  },
});
