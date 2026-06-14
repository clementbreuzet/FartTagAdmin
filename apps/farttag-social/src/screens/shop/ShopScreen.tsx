import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../../features/feed/components/FeedState';
import { ChestCard } from '../../features/shop/components/ChestCard';
import { OfferCard } from '../../features/shop/components/OfferCard';
import { RevealModal } from '../../features/shop/components/RevealModal';
import { useShopStore } from '../../features/shop/shopStore';
import type { LootboxDefinition } from '../../features/shop/types';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type ShopScreenProps = NativeStackScreenProps<RootStackParamList, 'ShopScreen'>;
type ShopSection = 'platform' | 'packs' | 'resources' | 'daily';

const chestImages = [
  require('../../assets/shop/chest-common.png'),
  require('../../assets/shop/chest-rare.png'),
  require('../../assets/shop/chest-epic.png'),
  require('../../assets/shop/chest-legendary.png'),
  require('../../assets/shop/chest-mythic.png'),
];
const offerXp = require('../../assets/shop/offer-xp.png');
const offerGas = require('../../assets/shop/offer-gas.png');
const offerEnergy = require('../../assets/shop/offer-energy.png');

const chestCatalog = [
  { accent: '#A8B3BA', name: 'Coffre commun', price: 500 },
  { accent: colors.neonCyan, name: 'Coffre rare', price: 1500 },
  { accent: colors.neonPurple, name: 'Coffre épique', price: 3500 },
  { accent: '#FF9D00', name: 'Coffre légendaire', price: 7500 },
  { accent: colors.neonGreen, name: 'Coffre mythique', price: 12000 },
] as const;

export const ShopScreen = (_props: ShopScreenProps) => {
  const [section, setSection] = useState<ShopSection>('platform');
  const error = useShopStore((state) => state.error);
  const hasLoaded = useShopStore((state) => state.hasLoaded);
  const isLoading = useShopStore((state) => state.isLoading);
  const isOpening = useShopStore((state) => state.isOpening);
  const lastReward = useShopStore((state) => state.lastReward);
  const lootboxes = useShopStore((state) => state.lootboxes);
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

  const chests = useMemo(() => chestCatalog.map((chest, index) => ({
    ...chest,
    image: chestImages[index],
    lootbox: lootboxes[index % Math.max(lootboxes.length, 1)] as LootboxDefinition | undefined,
  })), [lootboxes]);

  const buyChest = (lootbox: LootboxDefinition | undefined, price: number) => {
    if (!lootbox || !wallet) {
      return;
    }
    if (price > wallet.flatulons) {
      Alert.alert('Solde insuffisant', 'Tu n’as pas assez de Flatulons pour ouvrir ce coffre.');
      return;
    }
    void openLootbox(lootbox.id);
  };

  if (isLoading && lootboxes.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState description="Préparation des coffres et des offres." loading title="Chargement de la boutique" />
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FeedState actionLabel="Réessayer" description={error ?? 'Boutique indisponible.'} onAction={() => void loadShop()} title="Boutique indisponible" tone="purple" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TES FLATULONS</Text>
          <Text style={styles.balance}>{wallet.flatulons.toLocaleString()} <Text style={styles.balanceIcon}>◆</Text></Text>
        </View>

        <View style={styles.tabs}>
          {([
            ['platform', 'PLATEFORME'],
            ['packs', 'PACKS'],
            ['resources', 'RESSOURCES'],
            ['daily', 'OFFRES DU JOUR'],
          ] as const).map(([value, label]) => (
            <Pressable key={value} onPress={() => setSection(value)} style={[styles.tab, section === value && styles.tabActive]}>
              <Text style={[styles.tabText, section === value && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {section === 'platform' ? (
          <>
            <SectionTitle title="COFFRES" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {chests.map((chest) => (
                <ChestCard
                  accent={chest.accent}
                  description={chest.lootbox?.description ?? 'Contient des éléments exclusifs.'}
                  disabled={isOpening}
                  image={chest.image}
                  isOpening={isOpening && openingLootboxId === chest.lootbox?.id}
                  key={chest.name}
                  name={chest.name}
                  onBuy={() => buyChest(chest.lootbox, chest.price)}
                  price={chest.price}
                />
              ))}
            </ScrollView>

            <SectionTitle title="OFFRES SPÉCIALES" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <OfferCard accent={colors.neonCyan} detail="+50% XP" duration="1H" image={offerXp} name="BOOST XP" onBuy={() => Alert.alert('Boost XP', 'Boost XP ajouté à ton inventaire.')} price={250} />
              <OfferCard accent={colors.neonGreen} detail="+100% GAZ" duration="30M" image={offerGas} name="BOOST GAZ" onBuy={() => Alert.alert('Boost Gaz', 'Boost Gaz ajouté à ton inventaire.')} price={200} />
              <OfferCard accent={colors.neonPurple} detail="Énergie au max" duration="x20" image={offerEnergy} name="ÉNERGIE MAX" onBuy={() => Alert.alert('Énergie Max', 'Énergie ajoutée à ton inventaire.')} price={300} />
            </ScrollView>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>
              {section === 'packs' ? 'PACKS PREMIUM' : section === 'resources' ? 'RESSOURCES' : 'OFFRES DU JOUR'}
            </Text>
            <Text style={styles.placeholderText}>
              {lastReward ? `Dernière récompense : ${lastReward.name}` : 'De nouvelles offres arrivent bientôt.'}
            </Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <RevealModal onClose={() => setRevealVisible(false)} reward={lastReward} visible={revealVisible} />
    </SafeAreaView>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionHeading}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.info}>i</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 44 },
  balanceCard: { alignItems: 'center', backgroundColor: '#0A1408', borderColor: colors.neonGreen, borderRadius: 21, borderWidth: 1, padding: 15 },
  balanceLabel: { color: colors.textSecondary, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  balance: { color: colors.neonGreen, fontSize: 32, fontWeight: '900', marginTop: 4 },
  balanceIcon: { fontSize: 20 },
  tabs: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', marginTop: 18 },
  tab: { alignItems: 'center', flex: 1, paddingBottom: 10, paddingTop: 8 },
  tabActive: { borderBottomColor: colors.neonGreen, borderBottomWidth: 2 },
  tabText: { color: colors.textMuted, fontSize: 7, fontWeight: '900' },
  tabTextActive: { color: colors.neonGreen },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', marginBottom: 12, marginTop: 22 },
  sectionTitle: { color: colors.neonGreen, fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
  info: { borderColor: colors.neonGreen, borderRadius: 8, borderWidth: 1, color: colors.neonGreen, fontSize: 8, marginLeft: 8, paddingHorizontal: 5, paddingVertical: 1 },
  placeholder: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.neonCyan, borderRadius: 22, borderWidth: 1, marginTop: 22, padding: 24 },
  placeholderTitle: { color: colors.neonCyan, fontSize: 15, fontWeight: '900' },
  placeholderText: { color: colors.textSecondary, fontSize: 10, marginTop: 8, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 10, marginTop: 14, textAlign: 'center' },
});

export default ShopScreen;
