import { colors } from './colors';

export const appTheme = {
  colors: {
    background: '#05070A',
    card: '#0B1018',
    neonCyan: '#00E5FF',
    neonGreen: '#7CFF00',
    neonPurple: '#B000FF',
    text: '#FFFFFF',
    textMuted: '#A0A8B8',
  },
  navigation: {
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.textPrimary,
  },
} as const;
