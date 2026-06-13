import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '../features/profile/profileStore';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type InventoryScreenProps = NativeStackScreenProps<RootStackParamList, 'InventoryScreen'>;

export const InventoryScreen = ({ navigation }: InventoryScreenProps) => {
  const inventory = useProfileStore((state) => state.inventory);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header onBack={navigation.goBack} title="Inventaire" />
        {inventory.map((item) => (
          <View key={item.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.type} · {item.rarity}</Text>
            </View>
            <Text style={styles.showcased}>{item.isShowcased ? 'EXPOSÉ' : ''}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Header = ({ onBack, title }: { onBack: () => void; title: string }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
    <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>RETOUR</Text></Pressable>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '900' },
  back: { borderColor: colors.neonCyan, borderRadius: 11, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  backText: { color: colors.neonCyan, fontSize: 8, fontWeight: '900' },
  row: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 14 },
  name: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  meta: { color: colors.textSecondary, fontSize: 9, marginTop: 4, textTransform: 'uppercase' },
  showcased: { color: colors.neonPurple, fontSize: 8, fontWeight: '900' },
});
