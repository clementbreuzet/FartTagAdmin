import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileApi } from '../../features/profile/profileApi';
import type { UserProfile } from '../../features/profile/types';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type PublicUserProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicUserProfileScreen'>;

export const PublicUserProfileScreen = ({ navigation, route }: PublicUserProfileScreenProps) => {
  const { avatarUrl, badgeRarity, displayName, title, username } = route.params;
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    profileApi.getPublicProfile(route.params.userId)
      .then((result) => {
        if (active) {
          setProfile(result);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [route.params.userId]);

  const resolvedAvatarUrl = profile?.avatarUrl ?? avatarUrl;
  const resolvedDisplayName = profile?.displayName ?? displayName;
  const resolvedUsername = profile?.username ?? username;
  const resolvedTitle = profile?.equippedTitle ?? title;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backText}>RETOUR</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.avatar}>
            {resolvedAvatarUrl ? (
              <Image source={{ uri: resolvedAvatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarFallback}>{(resolvedDisplayName ?? resolvedUsername ?? 'FS').slice(0, 2).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.displayName}>{resolvedDisplayName ?? 'Utilisateur public'}</Text>
          <Text style={styles.username}>@{resolvedUsername ?? 'unknown'}</Text>
          <Text style={styles.meta}>{resolvedTitle ?? 'Sans titre'}</Text>
          <Text style={[styles.meta, styles.badge]}>{badgeRarity ?? 'common'}</Text>
          {profile ? (
            <View style={styles.stats}>
              <Text style={styles.stat}>NIVEAU {profile.level}</Text>
              <Text style={styles.stat}>{profile.globalStats.totalFarts} FARTS</Text>
              <Text style={styles.stat}>{profile.globalStats.publicFarts} PUBLICS</Text>
              <Text style={styles.stat}>{profile.globalStats.legendaryFarts} LEGENDAIRES</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
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
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
  },
  stat: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
});

export default PublicUserProfileScreen;

