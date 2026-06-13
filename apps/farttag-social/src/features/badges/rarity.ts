import { colors } from '../../theme/colors';
import type { BadgeRarity } from './types';

export const rarityColors: Record<BadgeRarity, string> = {
  common: colors.textSecondary,
  rare: colors.neonCyan,
  epic: colors.neonPurple,
  legendary: colors.neonGreen,
  mythic: '#FF4DC4',
};
