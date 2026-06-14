import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import type { RootTabParamList } from '../../navigation/types';

type TabIconProps = {
  focused: boolean;
  name: keyof RootTabParamList;
};

const iconSources: Record<keyof RootTabParamList, ImageSourcePropType> = {
  HomeTab: require('../../assets/navigation/nav-home-clean.png'),
  DetectionTab: require('../../assets/navigation/nav-detection-clean.png'),
  ShopTab: require('../../assets/navigation/nav-shop-clean.png'),
  SocialTab: require('../../assets/navigation/nav-social-clean.png'),
  ProfileTab: require('../../assets/navigation/nav-profile-clean.png'),
};

export const TabIcon = ({ focused, name }: TabIconProps) => (
  <View style={[styles.container, focused ? styles.focused : styles.inactive]}>
    <Image source={iconSources[name]} style={styles.icon} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 68,
    justifyContent: 'center',
    width: 72,
  },
  focused: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  inactive: {
    opacity: 0.48,
    transform: [{ scale: 0.94 }],
  },
  icon: {
    height: 68,
    resizeMode: 'contain',
    width: 68,
  },
});
