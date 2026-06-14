import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FartHistoryEvent } from '../../history/types';

type QuickHistoryCardProps = {
  events: FartHistoryEvent[];
  onOpen: (event: FartHistoryEvent) => void;
  onSeeAll: () => void;
};

const accents = [colors.neonGreen, colors.neonCyan, '#FF9D00'] as const;

const categoryForScore = (score: number) => score >= 90 ? 'Légendaire' : score >= 75 ? 'Catégorie 3' : 'Assassin silencieux';

const formatTime = (date: string) => new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(date));

export const QuickHistoryCard = ({ events, onOpen, onSeeAll }: QuickHistoryCardProps) => (
  <View style={styles.card}>
    <Text style={styles.heading}>HISTORIQUE RAPIDE</Text>
    {events.slice(0, 3).map((event, index) => {
      const accent = accents[index % accents.length];
      return (
        <Pressable key={event.id} onPress={() => onOpen(event)} style={styles.row}>
          <View style={[styles.hexBadge, { borderColor: accent }]}>
            <Text style={[styles.hexGlyph, { color: accent }]}>●</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.time}>Aujourd’hui · {formatTime(event.occurredAt)}</Text>
            <Text style={styles.category}>{categoryForScore(event.officialScore)}</Text>
          </View>
          <View style={styles.score}>
            <Text style={[styles.scoreValue, { color: accent }]}>{event.officialScore}</Text>
            <Text style={styles.scoreLabel}>PTS</Text>
          </View>
        </Pressable>
      );
    })}
    <Pressable onPress={onSeeAll} style={styles.seeAll}>
      <Text style={styles.seeAllText}>VOIR TOUT ›</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#050B10', borderColor: '#00E5FF35', borderRadius: 20, borderWidth: 1, flex: 1, padding: 13 },
  heading: { color: colors.neonGreen, fontSize: 9, fontWeight: '900', letterSpacing: 0.7, marginBottom: 7 },
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 8, paddingVertical: 8 },
  hexBadge: { alignItems: 'center', borderRadius: 9, borderWidth: 1, height: 30, justifyContent: 'center', transform: [{ rotate: '45deg' }], width: 30 },
  hexGlyph: { fontSize: 11, transform: [{ rotate: '-45deg' }] },
  copy: { flex: 1 },
  time: { color: colors.textSecondary, fontSize: 7 },
  category: { color: colors.textPrimary, fontSize: 8, fontWeight: '800', marginTop: 3 },
  score: { alignItems: 'flex-end' },
  scoreValue: { fontSize: 16, fontWeight: '900' },
  scoreLabel: { color: colors.textMuted, fontSize: 6, fontWeight: '900' },
  seeAll: { alignItems: 'center', paddingTop: 10 },
  seeAllText: { color: colors.neonGreen, fontSize: 7, fontWeight: '900' },
});
