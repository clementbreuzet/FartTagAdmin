import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme/theme';

type EventCelebrationModalProps = {
  accentColor?: string;
  children: ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

export const EventCelebrationModal = ({
  accentColor = appTheme.colors.toxicGreen,
  children,
  onClose,
  title,
  visible,
}: EventCelebrationModalProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const rotateProgress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      rotateProgress.setValue(0);
      scale.setValue(0.72);
      return;
    }

    opacity.setValue(0);
    rotateProgress.setValue(0);
    scale.setValue(0.72);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(rotateProgress, {
          duration: 430,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          damping: 11,
          mass: 0.7,
          stiffness: 170,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity, rotateProgress, scale, visible]);

  const rotate = rotateProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '360deg'],
  });

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.blurLayer} />
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: `${accentColor}AA`,
              opacity,
              shadowColor: accentColor,
              transform: [{ rotate }, { scale }],
            },
          ]}
        >
          <Pressable
            accessibilityLabel="Fermer"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [
              styles.close,
              { borderColor: `${accentColor}99` },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.closeText, { color: accentColor }]}>×</Text>
          </Pressable>
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: '#020407AA',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 22,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  blurLayer: {
    backgroundColor: '#7CFF0018',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#050B10F7',
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 340,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
    shadowOpacity: 0.34,
    shadowRadius: 22,
    width: '100%',
  },
  close: {
    alignItems: 'center',
    backgroundColor: '#101620',
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
  },
  closeText: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.94 }],
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
