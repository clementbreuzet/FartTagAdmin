import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type PaginationControlsProps = {
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
  pageCount: number;
};

const previousImage = require('../../assets/pagination/page-prev.png');
const nextImage = require('../../assets/pagination/page-next.png');

export const PaginationControls = ({
  currentPage,
  onNext,
  onPrevious,
  pageCount,
}: PaginationControlsProps) => {
  const isFirstPage = currentPage <= 0;
  const isLastPage = currentPage >= pageCount - 1;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Previous page"
        disabled={isFirstPage}
        onPress={onPrevious}
        style={[styles.arrowButton, isFirstPage && styles.disabled]}
      >
        <Image source={previousImage} style={styles.arrowImage} />
      </Pressable>
      <Text style={styles.label}>{currentPage + 1} / {pageCount}</Text>
      <Pressable
        accessibilityLabel="Next page"
        disabled={isLastPage}
        onPress={onNext}
        style={[styles.arrowButton, isLastPage && styles.disabled]}
      >
        <Image source={nextImage} style={styles.arrowImage} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  arrowButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 64,
  },
  arrowImage: {
    height: 44,
    resizeMode: 'contain',
    width: 64,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.3,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '900',
    minWidth: 52,
    textAlign: 'center',
  },
});
