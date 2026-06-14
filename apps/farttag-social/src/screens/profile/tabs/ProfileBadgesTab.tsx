import React, { useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BadgeDetailsModal } from '../../../features/badges/components/BadgeDetailsModal';
import { BadgeFilterBar } from '../../../features/badges/components/BadgeFilterBar';
import { BadgeHexagon } from '../../../features/badges/components/BadgeHexagon';
import { useBadgesStore } from '../../../features/badges/badgesStore';
import { FeedState } from '../../../features/feed/components/FeedState';
import { colors } from '../../../theme/colors';

export const ProfileBadgesTab = () => {
  const badges = useBadgesStore((state) => state.badges);
  const error = useBadgesStore((state) => state.error);
  const filter = useBadgesStore((state) => state.filter);
  const hasLoaded = useBadgesStore((state) => state.hasLoaded);
  const isLoading = useBadgesStore((state) => state.isLoading);
  const isRefreshing = useBadgesStore((state) => state.isRefreshing);
  const selectedBadgeId = useBadgesStore((state) => state.selectedBadgeId);
  const loadBadges = useBadgesStore((state) => state.loadBadges);
  const refreshBadges = useBadgesStore((state) => state.refreshBadges);
  const selectBadge = useBadgesStore((state) => state.selectBadge);
  const setFilter = useBadgesStore((state) => state.setFilter);

  const visibleBadges = useMemo(
    () => badges.filter((badge) => filter === 'all' || badge.rarity === filter),
    [badges, filter],
  );
  const unlockedCount = badges.filter((badge) => badge.isUnlocked).length;
  const completion = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;
  const selectedBadge = badges.find((badge) => badge.id === selectedBadgeId) ?? null;

  if (isLoading && badges.length === 0) {
    return (
      <View style={styles.safeArea}>
        <FeedState description="Chargement du catalogue et de ta progression." loading title="Chargement des badges" />
      </View>
    );
  }

  if (error && badges.length === 0) {
    return (
      <View style={styles.safeArea}>
        <FeedState actionLabel="Réessayer" description={error} onAction={() => void loadBadges()} title="Badges indisponibles" tone="purple" />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={
          <FeedState description="Aucun badge ne correspond à cette rareté." title="Aucun badge" />
        }
        ListHeaderComponent={
          <>
            <View style={styles.progressCard}>
              <View>
                <Text style={styles.progressValue}>{unlockedCount} / {badges.length}</Text>
                <Text style={styles.progressLabel}>BADGES DÉBLOQUÉS</Text>
              </View>
              <Text style={styles.completion}>{completion}%</Text>
            </View>
            <BadgeFilterBar activeFilter={filter} onChange={setFilter} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        data={visibleBadges}
        keyExtractor={(badge) => badge.id}
        numColumns={3}
        refreshControl={
          <RefreshControl
            colors={[colors.neonGreen]}
            onRefresh={() => void refreshBadges()}
            refreshing={isRefreshing}
            tintColor={colors.neonGreen}
          />
        }
        renderItem={({ item }) => <BadgeHexagon badge={item} onPress={(badge) => selectBadge(badge.id)} />}
        showsVerticalScrollIndicator={false}
      />
      <BadgeDetailsModal badge={selectedBadge} onClose={() => selectBadge(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
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
  progressCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.neonPurple,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 14,
  },
  progressValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  completion: {
    color: colors.neonPurple,
    fontSize: 25,
    fontWeight: '900',
  },
  gridRow: {
    justifyContent: 'flex-start',
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginBottom: 14,
    textAlign: 'center',
  },
});

export default ProfileBadgesTab;

