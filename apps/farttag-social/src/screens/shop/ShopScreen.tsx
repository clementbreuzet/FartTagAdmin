import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCelebrationModal } from '../../components/layout/EventCelebrationModal';
import { GemIcon } from '../../components/ui/GemIcon';
import { FeedState } from '../../features/feed/components/FeedState';
import { RevealModal } from '../../features/shop/components/RevealModal';
import { useShopStore } from '../../features/shop/shopStore';
import type { LootboxDefinition, LootboxRarity } from '../../features/shop/types';
import { t, useLanguageStore } from '../../i18n/translations';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenTitle } from '../../shared/components';
import { useUserStore } from '../../store/userStore';
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

const gemPrices: Record<LootboxRarity, number> = {
  common: 45,
  rare: 110,
  epic: 280,
  legendary: 720,
  mythic: 1450,
};

const gemPacks = [
  {
    id: 'small',
    amount: 100,
    image: require('../../assets/currency/gems-small.png'),
    price: '5,99 EUR',
  },
  {
    id: 'medium',
    amount: 500,
    image: require('../../assets/currency/gems-medium.png'),
    price: '19,99 EUR',
  },
  {
    id: 'large',
    amount: 5000,
    image: require('../../assets/currency/gems-large.png'),
    price: '49,99 EUR',
  },
];

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
  const gems = useUserStore((state) => state.gems);
  const [insufficientVisible, setInsufficientVisible] = React.useState(false);

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
      setInsufficientVisible(true);
      return;
    }
    void openLootbox(lootbox.id);
  };

  if (isLoading && lootboxes.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.stateContent}>
          <ScreenTitle title={t('screens.shop.title')} />
          <FeedState description={t('shop.loading.description')} loading title={t('shop.loading.title')} />
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
            description={error ?? t('shop.unavailable.description')}
            onAction={() => void loadShop()}
            title={t('shop.unavailable.title')}
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
        <Text style={styles.sectionTitle}>{t('shop.gemPacks')}</Text>
        <View style={styles.gemGrid}>
          {gemPacks.map((pack) => (
            <GemPackCard key={pack.id} pack={pack} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('shop.chests')}</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('shop.chests')}</Text>
          <Text style={styles.balance}>{wallet.flatulons.toLocaleString()} <Text style={styles.balanceIcon}>◇</Text></Text>
        </View>

        <View style={styles.grid}>
          {sortedLootboxes.map((lootbox) => (
            <SimpleChestCard
              disabled={isOpening}
              isOpening={openingLootboxId === lootbox.id}
              key={lootbox.id}
              lootbox={lootbox}
              onGemPress={() => setInsufficientVisible(true)}
              onOpen={() => openChest(lootbox)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <EventCelebrationModal
        accentColor={colors.neonCyan}
        onClose={() => setInsufficientVisible(false)}
        title={t('shop.insufficient.title')}
        visible={insufficientVisible}
      >
        <View style={styles.insufficientContent}>
          <GemIcon size={116} />
          <Text style={styles.insufficientText}>{t('shop.insufficient.message')}</Text>
          <View style={styles.insufficientPill}>
            <GemIcon size={34} />
            <Text style={styles.insufficientPillText}>
              {gems.toLocaleString()} {t('currency.gems')}
            </Text>
          </View>
          <Text style={styles.buyGemsText}>{t('shop.buyGems')}</Text>
        </View>
      </EventCelebrationModal>
      <RevealModal onClose={() => setRevealVisible(false)} reward={lastReward} visible={revealVisible} />
    </SafeAreaView>
  );
};

const SimpleChestCard = ({
  disabled,
  isOpening,
  lootbox,
  onGemPress,
  onOpen,
}: {
  disabled: boolean;
  isOpening: boolean;
  lootbox: LootboxDefinition;
  onGemPress: () => void;
  onOpen: () => void;
}) => {
  const accent = rarityAccents[lootbox.rarity];
  return (
    <Pressable
      disabled={disabled}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.chestCard,
        { borderColor: accent, shadowColor: accent },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Image source={chestImages[lootbox.rarity]} style={styles.chestImage} />
      <Text style={[styles.chestName, { color: accent }]}>{lootbox.name}</Text>
      <View style={styles.priceStack}>
        <PriceChip
          accent={accent}
          label={t('currency.flatulons')}
          loading={isOpening}
          value={lootbox.priceFlatulons.toLocaleString()}
        />
        <Text style={styles.orText}>{t('shop.price.or')}</Text>
        <Pressable disabled={disabled} onPress={onGemPress} style={({ pressed }) => [pressed && styles.pressed]}>
          <PriceChip
            accent={colors.neonCyan}
            icon={<GemIcon size={32} />}
            label={t('currency.gems')}
            value={gemPrices[lootbox.rarity].toLocaleString()}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

const PriceChip = ({
  accent,
  icon,
  label,
  loading = false,
  value,
}: {
  accent: string;
  icon?: React.ReactNode;
  label: string;
  loading?: boolean;
  value: string;
}) => (
  <View style={[styles.priceChip, { borderColor: `${accent}AA` }]}>
    {icon}
    {loading ? (
      <ActivityIndicator color={accent} size="small" />
    ) : (
      <Text style={[styles.priceValue, { color: accent }]}>{value}</Text>
    )}
    <Text numberOfLines={1} style={styles.priceLabel}>{label}</Text>
  </View>
);

const GemPackCard = ({
  pack,
}: {
  pack: {
    amount: number;
    image: ImageSourcePropType;
    price: string;
  };
}) => (
  <Pressable style={({ pressed }) => [styles.gemPackCard, pressed && styles.pressed]}>
    <Image source={pack.image} style={styles.gemPackImage} />
    <View style={styles.gemPackAmount}>
      <GemIcon size={34} />
      <Text style={styles.gemPackAmountText}>{pack.amount.toLocaleString()}</Text>
    </View>
    <Text style={styles.gemPackPrice}>{pack.price}</Text>
  </Pressable>
);

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
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  balanceCard: {
    alignItems: 'center',
    backgroundColor: '#0A1408',
    borderColor: colors.neonGreen,
    borderRadius: 18,
    borderWidth: 1,
    display: 'none',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  chestCard: {
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 252,
    padding: 10,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    width: '48%',
  },
  chestImage: {
    height: 118,
    resizeMode: 'contain',
    width: '100%',
  },
  chestName: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
    minHeight: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  priceStack: {
    alignSelf: 'stretch',
    gap: 5,
    marginTop: 8,
  },
  priceChip: {
    alignItems: 'center',
    backgroundColor: '#061016',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 6,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  priceLabel: {
    color: colors.textSecondary,
    flexShrink: 1,
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  orText: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  gemGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  gemPackCard: {
    alignItems: 'center',
    backgroundColor: '#020A12',
    borderColor: `${colors.neonCyan}66`,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 168,
    padding: 8,
  },
  gemPackImage: {
    height: 86,
    resizeMode: 'contain',
    width: '100%',
  },
  gemPackAmount: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 4,
  },
  gemPackAmountText: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '900',
  },
  gemPackPrice: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
  },
  insufficientContent: {
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  insufficientText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  insufficientPill: {
    alignItems: 'center',
    backgroundColor: '#061621',
    borderColor: `${colors.neonCyan}77`,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  insufficientPillText: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  buyGemsText: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
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
