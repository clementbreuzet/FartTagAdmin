import { File, Paths } from 'expo-file-system';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Language, TranslationKey, translations } from './translations';

const languageFile = new File(Paths.document, 'farttag-language.txt');
const languageCodes = Object.keys(translations) as Language[];

const getSystemLanguage = (): Language => {
  const code = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0]?.toLowerCase();
  return languageCodes.includes(code as Language) ? (code as Language) : 'en';
};

type I18nContextValue = {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<Language>(getSystemLanguage);

  useEffect(() => {
    const loadLanguage = async () => {
      if (!languageFile.exists) {
        return;
      }

      const savedLanguage = (await languageFile.text()).trim() as Language;
      if (languageCodes.includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    };

    void loadLanguage();
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    languageFile.write(nextLanguage);
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    locale: language,
    setLanguage,
    t: (key) => {
      const catalog = translations[language] as Partial<Record<TranslationKey, string>>;
      return catalog[key] ?? translations.en[key];
    },
  }), [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
};
