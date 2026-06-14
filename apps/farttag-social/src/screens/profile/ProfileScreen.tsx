import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubmenuTabs } from '../../shared/components';
import { useBadgesStore } from '../../features/badges/badgesStore';
import { useHistoryStore } from '../../features/history/historyStore';
import { useInventoryStore } from '../../features/inventory/inventoryStore';
import { useProfileStore } from '../../features/profile/profileStore';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { ProfileOverview } from './ProfileOverview';
import { ProfileBadgesTab } from './tabs/ProfileBadgesTab';
import { ProfileHistoryTab } from './tabs/ProfileHistoryTab';
import { ProfileInventoryTab } from './tabs/ProfileInventoryTab';
import { ProfileSettingsTab } from './tabs/ProfileSettingsTab';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;
export type ProfileTab = 'badges' | 'history' | 'inventory' | 'profile' | 'settings';

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const loadBadges = useBadgesStore((state) => state.loadBadges);
  const badgesHaveLoaded = useBadgesStore((state) => state.hasLoaded);
  const loadHistory = useHistoryStore((state) => state.loadHistory);
  const historyHasLoaded = useHistoryStore((state) => state.hasLoaded);
  const loadInventory = useInventoryStore((state) => state.loadInventory);
  const inventoryHasLoaded = useInventoryStore((state) => state.hasLoaded);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const profileHasLoaded = useProfileStore((state) => state.hasLoaded);

  useEffect(() => {
    if (!profileHasLoaded) {
      void loadProfile();
    }
    if (!badgesHaveLoaded) {
      void loadBadges();
    }
    if (!historyHasLoaded) {
      void loadHistory();
    }
    if (!inventoryHasLoaded) {
      void loadInventory();
    }
  }, [
    badgesHaveLoaded,
    historyHasLoaded,
    inventoryHasLoaded,
    loadBadges,
    loadHistory,
    loadInventory,
    loadProfile,
    profileHasLoaded,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubmenuTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { label: 'Profil', value: 'profile' },
          { label: 'Badges', value: 'badges' },
          { label: 'Historique', value: 'history' },
          { label: 'Inventaire', value: 'inventory' },
          { label: 'Reglages', value: 'settings' },
        ]}
      />
      <View style={styles.content}>
        <View style={[styles.panel, activeTab !== 'profile' && styles.hiddenPanel]}>
          <ProfileOverview navigation={navigation} onTabChange={setActiveTab} />
        </View>
        <View style={[styles.panel, activeTab !== 'badges' && styles.hiddenPanel]}>
          <ProfileBadgesTab />
        </View>
        <View style={[styles.panel, activeTab !== 'history' && styles.hiddenPanel]}>
          <ProfileHistoryTab navigation={navigation} />
        </View>
        <View style={[styles.panel, activeTab !== 'inventory' && styles.hiddenPanel]}>
          <ProfileInventoryTab />
        </View>
        <View style={[styles.panel, activeTab !== 'settings' && styles.hiddenPanel]}>
          <ProfileSettingsTab />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
  },
  panel: {
    flex: 1,
  },
  hiddenPanel: {
    display: 'none',
  },
});

export default ProfileScreen;
