import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedState } from '../../features/feed/components/FeedState';
import { RevealModal } from '../../features/shop/components/RevealModal';
import { useShopStore } from '../../features/shop/shopStore';
import type { LootboxDefinition, LootboxRarity } from '../../features/shop/types';
import { t, useLanguageStore } from '../../i18n/translations';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenTitle } from '../../shared/components';
import { colors } from '../../theme/colors';

type ShopScreenProps = NativeStackScreenProps<RootStackParamList, 'ShopScreen'>;

const chestImages: Record<LootboxRarity, ImageSourcePropType> = {
  common: require('../../assets/shop/chest-common.png'),
  rare: require('../../assets/shop/chest-rare.png'),
  epic: require('../../assets/shop/chest-epic.png'),
  legendary: require('../../assets/shop/chest-legendary.png'),
  mythic: require('../../assets/shop/chest-mythic.png'),
};

const rarityAccents: Record<LootboxRarity, string> = {
  common: '#A8B3BA',
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: '#FF9D00',
  mythic: colors.neonGreen,
};

const rarityOrder: Record<LootboxRarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

export const ShopScreen = (_props: ShopScreenProps) => {
  useLanguageStore((state) => state.locale);
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

  const openChest = (lootbox: LootboxDefinition) => {
    if (!wallet) {
      return;
    }
    if (lootbox.priceFlatulons > wallet.flatulons) {
      Alert.alert('Solde insuffisant', "Tu n'as pas assez de Flatulons pour ouvrir ce coffre.");
      return;
    }
    void openLootbox(lootbox.id);
  };

  if (isLoading && lootboxes.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.shop.title')} />
          <FeedState description="Preparation des coffres." loading title="Chargement de la boutique" />
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.shop.title')} />
          <FeedState
            actionLabel="Reessayer"
            description={error ?? 'Boutique indisponible.'}
            onAction={() => void loadShop()}
            title="Boutique indisponible"
            tone="purple"
          />
        </View>
      </SafeAreaView>
    );
  }

  const sortedLootboxes = [...lootboxes].sort((left, right) => rarityOrder[left.rarity] - rarityOrder[right.rarity]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenTitle title={t('screens.shop.title')} />

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TES FLATULONS</Text>
          <Text style={styles.balance}>{wallet.flatulons.toLocaleString()} <Text style={styles.balanceIcon}>◇</Text></Text>
        </View>

        <View style={styles.grid}>
          {sortedLootboxes.map((lootbox) => (
            <SimpleChestCard
              disabled={isOpening}
              isOpening={openingLootboxId === lootbox.id}
              key={lootbox.id}
              lootbox={lootbox}
              onOpen={() => openChest(lootbox)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <RevealModal onClose={() => setRevealVisible(false)} reward={lastReward} visible={revealVisible} />
    </SafeAreaView>
  );
};

const SimpleChestCard = ({
  disabled,
  isOpening,
  lootbox,
  onOpen,
}: {
  disabled: boolean;
  isOpening: boolean;
  lootbox: LootboxDefinition;
  onOpen: () => void;
}) => {
  const accent = rarityAccents[lootbox.rarity];
  return (
    <View style={[styles.chestCard, { borderColor: accent, shadowColor: accent }]}>
      <Image source={chestImages[lootbox.rarity]} style={styles.chestImage} />
      <Text style={[styles.chestName, { color: accent }]}>{lootbox.name}</Text>
      <Text style={styles.price}>{lootbox.priceFlatulons.toLocaleString()} Flatulons</Text>
      <Pressable
        disabled={disabled}
        onPress={onOpen}
        style={({ pressed }) => [
          styles.openButton,
          { borderColor: accent },
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {isOpening ? (
          <ActivityIndicator color={accent} size="small" />
        ) : (
          <Text style={[styles.openText, { color: accent }]}>OUVRIR</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 44,
  },
  stateContent: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    alignItems: 'center',
    backgroundColor: '#0A1408',
    borderColor: colors.neonGreen,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  balance: {
    color: colors.neonGreen,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  balanceIcon: {
    fontSize: 18,
  },
  grid: {
    gap: 12,
  },
  chestCard: {
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  chestImage: {
    height: 156,
    resizeMode: 'contain',
    width: '100%',
  },
  chestName: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  openButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 42,
    width: '100%',
  },
  openText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  error: {
    color: colors.danger,
    fontSize: 10,
    marginTop: 14,
    textAlign: 'center',
  },
});

export default ShopScreen;
