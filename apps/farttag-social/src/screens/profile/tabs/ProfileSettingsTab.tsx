import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LabelValueRow, SurfaceCard } from '../../../shared/components';
import { colors } from '../../../theme/colors';

export const ProfileSettingsTab = () => (
  <View style={styles.safeArea}>
    <View style={styles.content}>
      <SurfaceCard style={styles.card}>
        <LabelValueRow label="Notifications" value="Actives" />
        <LabelValueRow label="Langue" value="Français" />
        <LabelValueRow label="Theme" value="Dark neon" />
        <LabelValueRow divider="none" label="Confidentialité" value="Standard" />
      </SurfaceCard>
    </View>
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
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    padding: 0,
  },
});

export default ProfileSettingsTab;

