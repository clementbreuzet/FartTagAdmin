import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FeedState } from '../../../features/feed/components/FeedState';
import { InventoryDetailModal } from '../../../features/inventory/components/InventoryDetailModal';
import { InventoryFilterBar, type InventoryFilter } from '../../../features/inventory/components/InventoryFilterBar';
import { InventoryHexCard } from '../../../features/inventory/components/InventoryHexCard';
import { useInventoryStore } from '../../../features/inventory/inventoryStore';
import type { InventoryItem } from '../../../features/profile/types';
import { colors } from '../../../theme/colors';

const inventoryFilterMap: Record<InventoryFilter, (item: InventoryItem) => boolean> = {
  all: () => true,
  title: (item) => item.slot === 'title',
  frame: (item) => item.slot === 'frame',
  effect: (item) => item.slot === 'effect',
  sticker: (item) => item.type === 'sticker',
  mythic: (item) => item.type === 'mythic' || item.rarity === 'mythic',
};

export const ProfileInventoryTab = () => {
  const [filter, setFilter] = useState<InventoryFilter>('all');

  const error = useInventoryStore((state) => state.error);
  const hasLoaded = useInventoryStore((state) => state.hasLoaded);
  const inventory = useInventoryStore((state) => state.inventory);
  const isEquippingItemId = useInventoryStore((state) => state.isEquippingItemId);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const isRefreshing = useInventoryStore((state) => state.isRefreshing);
  const loadInventory = useInventoryStore((state) => state.loadInventory);
  const refreshInventory = useInventoryStore((state) => state.refreshInventory);
  const equipItem = useInventoryStore((state) => state.equipItem);
  const selectedItemId = useInventoryStore((state) => state.selectedItemId);
  const selectItem = useInventoryStore((state) => state.selectItem);

  const selectedItem = useMemo(
    () => inventory.find((item) => item.id === selectedItemId) ?? null,
    [inventory, selectedItemId],
  );

  const filteredInventory = useMemo(
    () => inventory.filter(inventoryFilterMap[filter]),
    [filter, inventory],
  );

  const equippedCount = inventory.filter((item) => item.isEquipped).length;
  const totalCount = inventory.length;

  if (isLoading && !hasLoaded) {
    return (
      <View style={styles.safeArea}>
        <FeedState loading description="Chargement de vos objets cosmetiques..." title="Inventaire" tone="purple" />
      </View>
    );
  }

  if (error && !hasLoaded) {
    return (
      <View style={styles.safeArea}>
        <FeedState
          actionLabel="Recharger"
          description={error}
          onAction={() => {
            void loadInventory();
          }}
          title="Inventaire indisponible"
          tone="purple"
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.content}
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshControl={
          <RefreshControl colors={[colors.neonGreen]} onRefresh={() => void refreshInventory()} refreshing={isRefreshing} />
        }
        ListEmptyComponent={
          <FeedState
            description="Aucun objet ne correspond a ce filtre."
            title="Inventaire vide"
            tone="cyan"
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.kicker}>FARTTAG ADMIN</Text>
            <Text style={styles.subtitle}>
              Objets cosmetiques gagnes, equipes et prets a etre exposes.
            </Text>
            <View style={styles.statsRow}>
              <Stat label="Total" value={String(totalCount)} />
              <Stat label="Equipes" value={String(equippedCount)} />
              <Stat label="Selection" value={selectedItem ? selectedItem.name : 'Aucun'} />
            </View>
            <InventoryFilterBar activeFilter={filter} onChange={setFilter} />
          </>
        }
        renderItem={({ item }) => (
          <InventoryHexCard
            item={item}
            onPress={(nextItem) => {
              selectItem(nextItem.id);
            }}
          />
        )}
      />
      <InventoryDetailModal
        isEquipping={Boolean(selectedItem && isEquippingItemId === selectedItem.id)}
        item={selectedItem}
        onClose={() => selectItem(null)}
        onEquip={(item) => {
          void equipItem(item.id);
        }}
      />
    </View>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
  },
  kicker: {
    color: colors.neonGreen,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

