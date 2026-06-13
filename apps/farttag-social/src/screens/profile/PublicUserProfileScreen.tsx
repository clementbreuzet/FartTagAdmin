import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type PublicUserProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicUserProfileScreen'>;

export const PublicUserProfileScreen = ({ navigation, route }: PublicUserProfileScreenProps) => {
  const { avatarUrl, badgeRarity, displayName, title, username } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>FARTTAG SOCIAL</Text>
            <Text style={styles.title}>Profil public</Text>
            <Text style={styles.subtitle}>Vue partageable d'un utilisateur.</Text>
          </View>
          <Pressable onPress={navigation.goBack} style={styles.backButton}>
            <Text style={styles.backText}>RETOUR</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarFallback}>{(displayName ?? username ?? 'FS').slice(0, 2).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.displayName}>{displayName ?? 'Utilisateur public'}</Text>
          <Text style={styles.username}>@{username ?? 'unknown'}</Text>
          <Text style={styles.meta}>{title ?? 'Sans titre'}</Text>
          <Text style={[styles.meta, styles.badge]}>{badgeRarity ?? 'common'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 29,
    fontWeight: '900',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },
  backButton: {
    borderColor: colors.neonCyan,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: colors.neonCyan,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonCyan,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.neonCyan,
    borderRadius: 40,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    color: colors.neonCyan,
    fontSize: 28,
    fontWeight: '900',
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 14,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  meta: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 12,
    textTransform: 'uppercase',
  },
  badge: {
    color: colors.neonGreen,
  },
});

export default PublicUserProfileScreen;

