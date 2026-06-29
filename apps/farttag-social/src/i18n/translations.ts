import { useLanguageStore, type Locale } from './languageStore';

const translations = {
  en: {
    'nav.detection': 'Detection',
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.shop': 'Shop',
    'nav.social': 'Social',
    'screens.detection.title': 'DETECTION CENTER',
    'screens.home.title': 'HOME',
    'screens.profile.title': 'PROFILE',
    'screens.shop.title': 'SHOP',
    'screens.social.title': 'SOCIAL',
  },
  fr: {
    'nav.detection': 'Detection',
    'nav.home': 'Accueil',
    'nav.profile': 'Profil',
    'nav.shop': 'Boutique',
    'nav.social': 'Social',
    'screens.detection.title': 'CENTRE DE DETECTION',
    'screens.home.title': 'ACCUEIL',
    'screens.profile.title': 'PROFIL',
    'screens.shop.title': 'BOUTIQUE',
    'screens.social.title': 'SOCIAL',
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;

const getLocale = (): Locale => useLanguageStore.getState().locale;

export const t = (key: TranslationKey) => translations[getLocale()][key];
export { languageOptions, useLanguageStore, type Locale } from './languageStore';
