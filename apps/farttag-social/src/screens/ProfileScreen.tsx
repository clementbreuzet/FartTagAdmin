import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../features/feed/components/FeedState';
import { ProfileStat } from '../features/profile/components/ProfileStat';
import { useProfileStore } from '../features/profile/profileStore';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const error = useProfileStore((state) => state.error);
  const hasLoaded = useProfileStore((state) => state.hasLoaded);
  const inventory = useProfileStore((state) => state.inventory);
  const isLoading = useProfileStore((state) => state.isLoading);
  const isRefreshing = useProfileStore((state) => state.isRefreshing);
  const profile = useProfileStore((state) => state.profile);
  const wallet = useProfileStore((state) => state.wallet);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadProfile();
    }
  }, [hasLoaded, isLoading, loadProfile]);

  const rareShowcase = useMemo(
    () => inventory.filter((item) => item.isShowcased && item.rarity !== 'common').slice(0, 6),
    [inventory],
  );

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState description="Chargement de ton identité FartTag Social." loading title="Chargement du profil" />
      </SafeAreaView>
    );
  }

  if (!profile || !wallet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState actionLabel="Réessayer" description={error ?? 'Profil indisponible.'} onAction={() => void loadProfile()} title="Profil indisponible" tone="purple" />
      </SafeAreaView>
    );
  }

  const frameColor = profile.equippedFrame?.accentColor ?? colors.neonCyan;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl colors={[colors.neonGreen]} onRefresh={() => void refreshProfile()} refreshing={isRefreshing} tintColor={colors.neonGreen} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>FARTTAG SOCIAL</Text>
            <Text style={styles.title}>Profil</Text>
          </View>
          <Pressable onPress={navigation.goBack} style={styles.backButton}>
            <Text style={styles.backText}>RETOUR</Text>
          </Pressable>
        </View>

        <View style={[styles.identityCard, { borderColor: frameColor, shadowColor: frameColor }]}>
          <View style={[styles.avatarFrame, { borderColor: frameColor }]}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{profile.displayName.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.displayName}>{profile.displayName}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={[styles.equippedTitle, { color: frameColor }]}>
            {profile.equippedTitle ?? 'Aucun titre équipé'}
          </Text>
          <Text style={styles.frameName}>{profile.equippedFrame?.name ?? 'Cadre standard'}</Text>

          <View style={styles.levelRow}>
            <Text style={styles.level}>NIVEAU {profile.level}</Text>
            <Text style={styles.progressLabel}>{profile.levelProgressPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${profile.levelProgressPercent}%` }]} />
          </View>

          <View style={styles.wallet}>
            <Text style={styles.walletValue}>{wallet.flatulons.toLocaleString()}</Text>
            <Text style={styles.walletLabel}>FLATULONS</Text>
          </View>
        </View>

        <SectionTitle title="Stats globales" />
        <View style={styles.stats}>
          <ProfileStat label="Farts totaux" value={`${profile.globalStats.totalFarts}`} />
          <ProfileStat label="Farts publics" value={`${profile.globalStats.publicFarts}`} />
          <ProfileStat label="Légendaires" value={`${profile.globalStats.legendaryFarts}`} />
          <ProfileStat label="Score moyen" value={`${profile.globalStats.averageOfficialScore}`} />
          <ProfileStat label="Réactions reçues" value={`${profile.globalStats.totalReactionsReceived}`} />
        </View>

        <SectionTitle title="Meilleur fart" />
        <View style={[styles.card, styles.bestCard]}>
          {profile.bestFart ? (
            <>
              <Text style={styles.bestScore}>{profile.bestFart.officialScore}</Text>
              <Text style={styles.bestLabel}>SCORE OFFICIEL RECORD</Text>
              <Text style={styles.bestDate}>{new Date(profile.bestFart.occurredAt).toLocaleDateString()}</Text>
              <Pressable onPress={() => navigation.navigate('FartDetailsScreen', { fartEventId: profile.bestFart!.id })} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>VOIR LE DÉTAIL</Text>
              </Pressable>
            </>
          ) : <Text style={styles.emptyText}>Aucun fart officiel pour le moment.</Text>}
        </View>

        <SectionTitle title="Badges récents" />
        <View style={styles.card}>
          {profile.recentBadges.length > 0 ? profile.recentBadges.slice(0, 3).map((badge) => (
            <View key={badge.id} style={styles.listRow}>
              <View style={styles.badgeIcon}><Text style={styles.badgeGlyph}>◆</Text></View>
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{badge.name}</Text>
                <Text style={styles.listDescription}>{badge.description}</Text>
              </View>
            </View>
          )) : <Text style={styles.emptyText}>Aucun badge récent.</Text>}
          <Pressable onPress={() => navigation.navigate('BadgesScreen')} style={styles.inlineButton}>
            <Text style={styles.inlineButtonText}>VOIR TOUS LES BADGES</Text>
          </Pressable>
        </View>

        <SectionTitle title="Objets rares exposés" />
        <View style={styles.card}>
          <View style={styles.showcase}>
            {rareShowcase.length > 0 ? rareShowcase.map((item) => (
              <View key={item.id} style={[styles.showcaseItem, item.rarity === 'legendary' && styles.legendaryItem]}>
                <Text style={styles.showcaseRarity}>{item.rarity}</Text>
                <Text numberOfLines={2} style={styles.showcaseName}>{item.name}</Text>
              </View>
            )) : <Text style={styles.emptyText}>Aucun objet rare exposé.</Text>}
          </View>
          <Pressable onPress={() => navigation.navigate('InventoryScreen')} style={styles.inlineButton}>
            <Text style={styles.inlineButtonText}>ACCÉDER À L'INVENTAIRE</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionTitle = ({ title }: { title: string }) => <Text style={styles.sectionTitle}>{title}</Text>;

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  eyebrow: { color: colors.neonGreen, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: colors.textPrimary, fontSize: 29, fontWeight: '800', marginTop: 3 },
  backButton: { borderColor: colors.neonCyan, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  identityCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, marginBottom: 22, padding: 20, shadowOpacity: 0.28, shadowRadius: 14 },
  avatarFrame: { borderRadius: 49, borderWidth: 2, height: 98, padding: 5, width: 98 },
  avatar: { borderRadius: 42, height: '100%', width: '100%' },
  avatarFallback: { alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 42, flex: 1, justifyContent: 'center' },
  avatarInitials: { color: colors.neonCyan, fontSize: 25, fontWeight: '900' },
  displayName: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', marginTop: 13 },
  username: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  equippedTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 12, textTransform: 'uppercase' },
  frameName: { color: colors.textMuted, fontSize: 8, marginTop: 4 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17, width: '100%' },
  level: { color: colors.neonGreen, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  progressLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  progressTrack: { backgroundColor: colors.border, borderRadius: 4, height: 7, marginTop: 7, overflow: 'hidden', width: '100%' },
  progressFill: { backgroundColor: colors.neonGreen, height: '100%' },
  wallet: { alignItems: 'center', borderColor: colors.neonPurple, borderRadius: 14, borderWidth: 1, marginTop: 18, paddingHorizontal: 28, paddingVertical: 10 },
  walletValue: { color: colors.neonPurple, fontSize: 23, fontWeight: '900' },
  walletLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  sectionTitle: { color: colors.neonCyan, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 22 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, marginBottom: 22, padding: 15 },
  bestCard: { alignItems: 'center', borderColor: colors.neonGreen },
  bestScore: { color: colors.neonGreen, fontSize: 43, fontWeight: '900' },
  bestLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  bestDate: { color: colors.textSecondary, fontSize: 9, marginTop: 6 },
  listRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 11, paddingVertical: 11 },
  badgeIcon: { alignItems: 'center', borderColor: colors.neonPurple, borderRadius: 15, borderWidth: 1, height: 30, justifyContent: 'center', width: 30 },
  badgeGlyph: { color: colors.neonPurple, fontSize: 11 },
  listCopy: { flex: 1 },
  listTitle: { color: colors.textPrimary, fontSize: 11, fontWeight: '800' },
  listDescription: { color: colors.textSecondary, fontSize: 9, marginTop: 3 },
  showcase: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  showcaseItem: { backgroundColor: colors.surfaceElevated, borderColor: colors.neonCyan, borderRadius: 13, borderWidth: 1, minHeight: 70, padding: 10, width: '48%' },
  legendaryItem: { borderColor: colors.neonPurple },
  showcaseRarity: { color: colors.neonPurple, fontSize: 7, fontWeight: '900', textTransform: 'uppercase' },
  showcaseName: { color: colors.textPrimary, fontSize: 10, fontWeight: '800', marginTop: 7 },
  inlineButton: { alignItems: 'center', borderColor: colors.neonCyan, borderRadius: 12, borderWidth: 1, marginTop: 14, paddingVertical: 10, width: '100%' },
  inlineButtonText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  emptyText: { color: colors.textSecondary, fontSize: 10 },
  error: { color: colors.danger, fontSize: 10, textAlign: 'center' },
});

export default ProfileScreen;
