import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../../theme/colors';

type AddFriendCardProps = {
  isAdding: boolean;
  onAdd: () => void;
  onInvite: () => void;
  onQueryChange: (query: string) => void;
  onScanQr: () => void;
  query: string;
};

export const AddFriendCard = ({
  isAdding,
  onAdd,
  onInvite,
  onQueryChange,
  onScanQr,
  query,
}: AddFriendCardProps) => (
  <View style={styles.card}>
    <View style={styles.headingRow}>
      <View style={styles.plus}>
        <Text style={styles.plusText}>+</Text>
      </View>
      <View style={styles.headingCopy}>
        <Text style={styles.title}>Ajouter un ami</Text>
        <Text style={styles.subtitle}>Agrandis ton réseau et lance de nouveaux défis.</Text>
      </View>
    </View>
    <View style={styles.searchRow}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onQueryChange}
        placeholder="Pseudo ou identifiant"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={query}
      />
      <Pressable
        disabled={isAdding || !query.trim()}
        onPress={onAdd}
        style={({ pressed }) => [
          styles.addButton,
          (isAdding || !query.trim()) && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.addButtonText}>{isAdding ? '...' : 'AJOUTER'}</Text>
      </Pressable>
    </View>
    <View style={styles.actions}>
      <MiniAction label="Scanner QR Code" onPress={onScanQr} />
      <MiniAction label="Inviter via lien" onPress={onInvite} />
    </View>
  </View>
);

const MiniAction = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.miniAction, pressed && styles.pressed]}>
    <Text style={styles.miniActionText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.neonPurple,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  plus: {
    alignItems: 'center',
    backgroundColor: '#E85CFF18',
    borderColor: colors.neonPurple,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  plusText: {
    color: colors.neonPurple,
    fontSize: 25,
    fontWeight: '700',
    marginTop: -2,
  },
  headingCopy: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#9CFF0018',
    borderColor: colors.neonGreen,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: colors.neonGreen,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  miniAction: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  miniActionText: {
    color: colors.neonCyan,
    fontSize: 9,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
