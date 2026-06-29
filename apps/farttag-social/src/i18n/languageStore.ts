import { create } from 'zustand';

export type Locale = 'en' | 'fr';

type LanguageState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const getDeviceLocale = (): Locale => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith('fr') ? 'fr' : 'en';
};

export const languageOptions: Array<{ flag: string; label: string; value: Locale }> = [
  { flag: '\uD83C\uDDEB\uD83C\uDDF7', label: 'Francais', value: 'fr' },
  { flag: '\uD83C\uDDFA\uD83C\uDDF8', label: 'English', value: 'en' },
];

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: getDeviceLocale(),
  setLocale: (locale) => set({ locale }),
}));
