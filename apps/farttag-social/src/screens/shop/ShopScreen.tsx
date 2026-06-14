import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, SubmenuTabs } from '../../shared/components';
import { FeedState } from '../../features/feed/components/FeedState';
import { LootboxCard } from '../../features/shop/components/LootboxCard';
import { RevealModal } from '../../features/shop/components/RevealModal';
import { useShopStore } from '../../features/shop/shopStore';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type ShopScreenProps = NativeStackScreenProps<RootStackParamList, 'ShopScreen'>;

export const ShopScreen = (_props: ShopScreenProps) => {
  const [section, setSection] = useState<'reactors' | 'latest'>('reactors');
  const error = useShopStore((state) => state.error);
  const hasLoaded = useShopStore((state) => state.hasLoaded);
  const isLoading = useShopStore((state) => state.isLoading);
  const isOpening = useShopStore((state) => state.isOpening);
  const lootboxes = useShopStore((state) => state.lootboxes);
  const lastReward = useShopStore((state) => state.lastReward);
  const openingLootboxId = useShopStore((state) => state.openingLootboxId);
  const revealVisible = useShopStore((state) => state.revealVisible);
  const wallet = useShopStore((state) => state.wallet);
  const loadShop = useShopStore((state) => state.loadShop);
  const openLootbox = useShopStore((state) => state.openLootbox);
  const setRevealVisible = useShopStore((state) => state.setRevealVisible);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadShop();
    }
  }, [hasLoaded, isLoading, loadShop]);

  const openLast = () => {
    if (!lootboxes[0]) {
      return;
    }
    void openLootbox(lootboxes[0].id);
  };

  if (isLoading && lootboxes.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <SubmenuTabs
          activeTab={section}
          onChange={setSection}
          tabs={[
            { label: 'Reacteurs', value: 'reactors' },
            { label: 'Dernier objet', value: 'latest' },
          ]}
        />
        <FeedState description="Préparation du Réacteur à Gaz." loading title="Chargement de la boutique" />
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <FeedState actionLabel="Réessayer" description={error ?? 'Boutique indisponible.'} onAction={() => void loadShop()} title="Boutique indisponible" tone="purple" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header />
        <SubmenuTabs
          activeTab={section}
          onChange={setSection}
          tabs={[
            { label: 'Reacteurs', value: 'reactors' },
            { label: 'Dernier objet', value: 'latest' },
          ]}
        />

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>SOLDE FLATULONS</Text>
          <Text style={styles.walletValue}>{wallet.flatulons.toLocaleString()}</Text>
        </View>

        {section === 'reactors' ? <View style={styles.gachaBanner}>
          <Text style={styles.bannerTitle}>RÉACTEUR À GAZ</Text>
          <Text style={styles.bannerText}>Le backend choisit la récompense, le mobile n'affiche que la révélation.</Text>
        </View> : null}

        {section === 'reactors' ? lootboxes.map((lootbox) => (
          <LootboxCard
            isOpening={isOpening && openingLootboxId === lootbox.id}
            key={lootbox.id}
            lootbox={lootbox}
            onOpen={(lootboxId) => {
              if (lootbox.priceFlatulons > wallet.flatulons) {
                Alert.alert('Solde insuffisant', 'Tu n’as pas assez de Flatulons pour ouvrir ce réacteur.');
                return;
              }
              void openLootbox(lootboxId);
            }}
            disabled={isOpening}
          />
        )) : null}

        {section === 'latest' ? <View style={styles.lastCard}>
          <Text style={styles.sectionTitle}>Dernier objet obtenu</Text>
          {lastReward ? (
            <View style={styles.lastReward}>
              <Text style={styles.lastGlyph}>{lastReward.iconGlyph}</Text>
              <View style={styles.lastCopy}>
                <Text style={styles.lastName}>{lastReward.name}</Text>
                <Text style={styles.lastDescription}>{lastReward.description}</Text>
                <Text style={styles.lastRarity}>{lastReward.rarity}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucune ouverture récente.</Text>
          )}
        </View> : null}

        <RevealModal
          onClose={() => setRevealVisible(false)}
          reward={lastReward}
          visible={revealVisible}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {section === 'reactors' ? <Pressable onPress={openLast} style={styles.quickButton}>
          <Text style={styles.quickText}>OUVRIR LE PREMIER RÉACTEUR</Text>
        </Pressable> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const Header = () => (
  <ScreenHeader subtitle="Boutique et tirages serveur du Réacteur à Gaz." title="Shop" />
);

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 44 },
  header: { display: 'none' },
  eyebrow: { color: colors.neonGreen, fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: colors.textPrimary, fontSize: 29, fontWeight: '900', marginTop: 3 },
  subtitle: { color: colors.textSecondary, fontSize: 10, marginTop: 5 },
  walletCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.neonGreen, borderRadius: 20, borderWidth: 1, marginBottom: 14, padding: 16 },
  walletLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  walletValue: { color: colors.neonGreen, fontSize: 34, fontWeight: '900', marginTop: 5 },
  gachaBanner: { backgroundColor: colors.surface, borderColor: colors.neonPurple, borderRadius: 20, borderWidth: 1, marginBottom: 16, padding: 16 },
  bannerTitle: { color: colors.neonPurple, fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  bannerText: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 7 },
  lastCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, marginTop: 4, padding: 15 },
  sectionTitle: { color: colors.neonCyan, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  lastReward: { flexDirection: 'row', gap: 13, alignItems: 'center' },
  lastGlyph: { color: colors.neonGreen, fontSize: 46, fontWeight: '900' },
  lastCopy: { flex: 1 },
  lastName: { color: colors.textPrimary, fontSize: 14, fontWeight: '900' },
  lastDescription: { color: colors.textSecondary, fontSize: 10, lineHeight: 16, marginTop: 4 },
  lastRarity: { color: colors.neonPurple, fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 7, textTransform: 'uppercase' },
  emptyText: { color: colors.textSecondary, fontSize: 10 },
  error: { color: colors.danger, fontSize: 10, marginTop: 14, textAlign: 'center' },
  quickButton: { alignItems: 'center', borderColor: colors.neonCyan, borderRadius: 14, borderWidth: 1, marginTop: 14, minHeight: 46, justifyContent: 'center' },
  quickText: { color: colors.neonCyan, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});

export default ShopScreen;

