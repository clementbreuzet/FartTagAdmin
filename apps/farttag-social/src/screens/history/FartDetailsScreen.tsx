import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReactionBar } from '../../features/feed/components/ReactionBar';
import { FeedState } from '../../features/feed/components/FeedState';
import { useFartDetailsStore } from '../../features/fart-details/fartDetailsStore';
import { AudioPlayButton } from '../../features/history/components/AudioPlayButton';
import { useHistoryStore } from '../../features/history/historyStore';
import type { RootStackParamList } from '../../navigation/types';
import { LabelValueRow, SectionTitle, SurfaceCard } from '../../shared/components';
import { colors } from '../../theme/colors';

type FartDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'FartDetailsScreen'>;

export const FartDetailsScreen = ({ navigation, route }: FartDetailsScreenProps) => {
  const details = useFartDetailsStore((state) => state.details);
  const error = useFartDetailsStore((state) => state.error);
  const isLoading = useFartDetailsStore((state) => state.isLoading);
  const isReacting = useFartDetailsStore((state) => state.isReacting);
  const isUpdatingVisibility = useFartDetailsStore((state) => state.isUpdatingVisibility);
  const loadDetails = useFartDetailsStore((state) => state.loadDetails);
  const react = useFartDetailsStore((state) => state.react);
  const reset = useFartDetailsStore((state) => state.reset);
  const setVisibility = useFartDetailsStore((state) => state.setVisibility);
  const currentlyPlayingId = useHistoryStore((state) => state.currentlyPlayingId);
  const playbackStatus = useHistoryStore((state) => state.playbackStatus);
  const playAudio = useHistoryStore((state) => state.playAudio);
  const stopAudio = useHistoryStore((state) => state.stopAudio);
  const playbackError = useHistoryStore((state) => state.error);

  useEffect(() => {
    void loadDetails(route.params.fartEventId);
    return () => {
      reset();
      stopAudio();
    };
  }, [loadDetails, reset, route.params.fartEventId, stopAudio]);

  const share = async () => {
    if (!details) {
      return;
    }
    await Share.share({
      message: `Mon fart officiel a obtenu ${details.officialScore} points sur FartTag Social.`,
      title: 'Mon score FartTag Social',
    });
  };

  if (isLoading || !details) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DetailsHeader onBack={navigation.goBack} />
        {error ? (
          <FeedState actionLabel="Réessayer" description={error} onAction={() => void loadDetails(route.params.fartEventId)} title="Détail indisponible" tone="purple" />
        ) : (
          <FeedState description="Récupération du résultat officiel." loading title="Chargement du détail" />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DetailsHeader onBack={navigation.goBack} />

        <View style={styles.scoreCard}>
          <View style={styles.authBadge}>
            <Text style={styles.authText}>{details.isAuthenticated ? '✓ AUTHENTIFIÉ' : 'NON AUTHENTIFIÉ'}</Text>
          </View>
          <Text style={styles.scoreLabel}>SCORE OFFICIEL</Text>
          <Text style={styles.score}>{details.officialScore}</Text>
          <Text style={styles.category}>{details.category.toUpperCase()}</Text>
          <Text style={styles.date}>{new Date(details.occurredAt).toLocaleString()}</Text>
        </View>

        <View style={styles.metrics}>
          <Metric accent="cyan" label="Audio" value={`${details.audioLevel.toFixed(1)} dB`} />
          <Metric accent="green" label="Gaz" value={`${details.gasLevel.toFixed(1)} kΩ`} />
          <Metric accent="purple" label="Durée" value={`${(details.durationMs / 1_000).toFixed(1)} s`} />
          <Metric accent="cyan" label="Température" value={`${details.temperatureCelsius.toFixed(1)} °C`} />
        </View>

        <SurfaceCard style={styles.card}>
          <SectionTitle accent="default" title="Device utilisé" />
          <LabelValueRow compact divider="top" label="Nom" value={details.device.name} />
          <LabelValueRow compact divider="top" label="Modèle" value={details.device.model} />
          <LabelValueRow compact divider="top" label="Device ID" value={details.device.id} />
        </SurfaceCard>

        <View style={[styles.card, styles.rewardCard]}>
          <Text style={styles.sectionTitle}>Récompenses gagnées</Text>
          <Text style={styles.flatulons}>+{details.rewards.flatulons} FLATULONS</Text>
          <Text style={styles.rewardText}>
            Badges : {details.rewards.badges.length > 0
              ? details.rewards.badges.map((badge) => badge.name).join(', ')
              : 'aucun badge débloqué'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Réactions</Text>
          <ReactionBar
            disabled={isReacting}
            onReact={(reaction) => void react(reaction)}
            reactions={details.reactions}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>Commentaires</Text>
            <Text style={styles.commentCount}>{details.comments.length}</Text>
          </View>
          {details.comments.length > 0 ? details.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{comment.authorDisplayName}</Text>
              <Text style={styles.commentMessage}>{comment.message}</Text>
              <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</Text>
            </View>
          )) : <Text style={styles.emptyText}>Aucun commentaire pour le moment.</Text>}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {playbackError ? <Text style={styles.error}>{playbackError}</Text> : null}

        <View style={styles.actions}>
          <AudioPlayButton
            disabled={!details.audioReplayUrl && !details.audioFileId}
            isCurrent={currentlyPlayingId === details.id}
            onPress={() => void playAudio(details)}
            status={playbackStatus}
          />
          <Pressable onPress={() => void share()} style={[styles.action, styles.shareAction]}>
            <Text style={[styles.actionText, styles.shareText]}>PARTAGER</Text>
          </Pressable>
          <Pressable
            disabled={isUpdatingVisibility}
            onPress={() => void setVisibility(details.visibility === 'public' ? 'private' : 'public')}
            style={[styles.action, styles.visibilityAction]}
          >
            {isUpdatingVisibility ? (
              <ActivityIndicator color={colors.neonGreen} size="small" />
            ) : (
              <Text style={[styles.actionText, styles.visibilityText]}>
                {details.visibility === 'public' ? 'RENDRE PRIVÉ' : 'RENDRE PUBLIC'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailsHeader = ({ onBack }: { onBack: () => void }) => (
  <Pressable onPress={onBack} style={styles.backButton}>
    <Text style={styles.backText}>RETOUR</Text>
  </Pressable>
);

const Metric = ({ accent, label, value }: { accent: 'cyan' | 'green' | 'purple'; label: string; value: string }) => {
  const accentColor = accent === 'cyan' ? colors.neonCyan : accent === 'green' ? colors.neonGreen : colors.neonPurple;
  return (
    <View style={[styles.metric, { borderColor: accentColor }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accentColor }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  eyebrow: { color: colors.neonGreen, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: colors.textPrimary, fontSize: 27, fontWeight: '800', marginTop: 3 },
  backButton: { borderColor: colors.neonCyan, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  scoreCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.neonGreen, borderRadius: 22, borderWidth: 1, marginBottom: 14, padding: 22 },
  authBadge: { borderColor: colors.neonCyan, borderRadius: 10, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 },
  authText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  scoreLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 14 },
  score: { color: colors.neonGreen, fontSize: 58, fontWeight: '900', marginTop: 2 },
  category: { color: colors.neonPurple, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 3 },
  date: { color: colors.textSecondary, fontSize: 10, marginTop: 5 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 14 },
  metric: { backgroundColor: colors.surface, borderRadius: 15, borderWidth: 1, flex: 1, minWidth: '46%', padding: 13 },
  metricLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  metricValue: { fontSize: 18, fontWeight: '900', marginTop: 6 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, marginBottom: 14, padding: 15 },
  rewardCard: { borderColor: colors.neonPurple },
  sectionTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  flatulons: { color: colors.neonPurple, fontSize: 23, fontWeight: '900' },
  rewardText: { color: colors.textSecondary, fontSize: 10, marginTop: 8 },
  commentsHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  commentCount: { color: colors.neonCyan, fontSize: 12, fontWeight: '900' },
  comment: { borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: 11 },
  commentAuthor: { color: colors.neonCyan, fontSize: 10, fontWeight: '900' },
  commentMessage: { color: colors.textPrimary, fontSize: 11, lineHeight: 17, marginTop: 4 },
  commentDate: { color: colors.textMuted, fontSize: 8, marginTop: 5 },
  emptyText: { color: colors.textSecondary, fontSize: 10 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 14, textAlign: 'center' },
  actions: { gap: 10 },
  action: { alignItems: 'center', borderRadius: 14, borderWidth: 1, justifyContent: 'center', minHeight: 47 },
  actionText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  playAction: { borderColor: colors.neonPurple },
  playText: { color: colors.neonPurple },
  shareAction: { borderColor: colors.neonCyan },
  shareText: { color: colors.neonCyan },
  visibilityAction: { borderColor: colors.neonGreen },
  visibilityText: { color: colors.neonGreen },
  disabled: { borderColor: colors.border, opacity: 0.45 },
});

export default FartDetailsScreen;

