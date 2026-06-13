import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootTabParamList } from '../../navigation/types';

type TabIconProps = {
  color: string;
  focused: boolean;
  name: keyof RootTabParamList;
};

const HomeIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.homeRoof, { borderBottomColor: color }]} />
    <View style={[styles.homeBody, { borderColor: color }]} />
    <View style={[styles.homeDoor, { backgroundColor: color }]} />
  </View>
);

const DetectionIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.targetRing, { borderColor: color }]} />
    <View style={[styles.targetDot, { backgroundColor: color }]} />
    <View style={[styles.targetHorizontal, { backgroundColor: color }]} />
    <View style={[styles.targetVertical, { backgroundColor: color }]} />
  </View>
);

const ShopIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.shopBag, { borderColor: color }]} />
    <View style={[styles.shopHandle, { borderColor: color }]} />
    <View style={[styles.shopSpark, { backgroundColor: color }]} />
  </View>
);

const SocialIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.personHead, { borderColor: color, left: 2 }]} />
    <View style={[styles.personHead, { borderColor: color, right: 2 }]} />
    <View style={[styles.personBody, { backgroundColor: color, left: 4 }]} />
    <View style={[styles.personBody, { backgroundColor: color, right: 4 }]} />
    <View style={[styles.linkBar, { backgroundColor: color }]} />
  </View>
);

const ProfileIcon = ({ color }: Pick<TabIconProps, 'color'>) => (
  <View style={styles.iconCanvas}>
    <View style={[styles.profileHead, { borderColor: color }]} />
    <View style={[styles.profileBody, { borderColor: color }]} />
  </View>
);

const iconComponents: Record<keyof RootTabParamList, React.ComponentType<Pick<TabIconProps, 'color'>>> = {
  HomeTab: HomeIcon,
  DetectionTab: DetectionIcon,
  ShopTab: ShopIcon,
  SocialTab: SocialIcon,
  ProfileTab: ProfileIcon,
};

export const TabIcon = ({ color, focused, name }: TabIconProps) => {
  const Icon = iconComponents[name];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: focused ? `${color}18` : 'transparent',
          borderColor: color,
          transform: [{ scale: focused ? 1.08 : 1 }],
        },
      ]}
    >
      <Icon color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 32,
  },
  iconCanvas: {
    height: 20,
    position: 'relative',
    width: 22,
  },
  homeRoof: {
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderLeftWidth: 8,
    borderRightColor: 'transparent',
    borderRightWidth: 8,
    height: 0,
    left: 3,
    position: 'absolute',
    top: 2,
    width: 0,
  },
  homeBody: {
    borderWidth: 1.5,
    borderRadius: 2,
    height: 8,
    left: 6,
    position: 'absolute',
    top: 9,
    width: 10,
  },
  homeDoor: {
    bottom: 1,
    height: 4,
    left: 9.25,
    position: 'absolute',
    width: 3.5,
  },
  targetRing: {
    borderRadius: 8,
    borderWidth: 1.5,
    height: 15,
    left: 4,
    position: 'absolute',
    top: 2.5,
    width: 15,
  },
  targetDot: {
    borderRadius: 2,
    height: 4,
    left: 9.5,
    position: 'absolute',
    top: 8,
    width: 4,
  },
  targetHorizontal: {
    height: 1,
    left: 1,
    position: 'absolute',
    top: 9.5,
    width: 21,
  },
  targetVertical: {
    height: 20,
    left: 10.5,
    position: 'absolute',
    top: 0,
    width: 1,
  },
  shopBag: {
    borderRadius: 3,
    borderWidth: 1.5,
    height: 11,
    left: 5,
    position: 'absolute',
    top: 7,
    width: 12,
  },
  shopHandle: {
    borderBottomWidth: 1.5,
    borderLeftColor: 'transparent',
    borderLeftWidth: 2,
    borderRightColor: 'transparent',
    borderRightWidth: 2,
    height: 0,
    left: 7.5,
    position: 'absolute',
    top: 3,
    width: 7,
  },
  shopSpark: {
    borderRadius: 1,
    height: 2,
    left: 13,
    position: 'absolute',
    top: 5,
    width: 2,
  },
  personHead: {
    borderRadius: 4,
    borderWidth: 1.3,
    height: 6,
    position: 'absolute',
    top: 2,
    width: 6,
  },
  personBody: {
    borderRadius: 3,
    bottom: 2,
    height: 6,
    position: 'absolute',
    width: 8,
  },
  linkBar: {
    borderRadius: 2,
    height: 1.5,
    left: 6,
    opacity: 0.75,
    position: 'absolute',
    top: 10,
    width: 10,
  },
  profileHead: {
    borderRadius: 5,
    borderWidth: 1.4,
    height: 7,
    left: 7,
    position: 'absolute',
    top: 2,
    width: 7,
  },
  profileBody: {
    borderRadius: 7,
    borderWidth: 1.4,
    height: 8,
    left: 4.5,
    position: 'absolute',
    top: 10,
    width: 12,
  },
});
