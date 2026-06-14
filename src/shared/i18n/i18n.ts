import { createInstance, type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultLocale, supportedLocales, type Locale } from './locale';
import { en } from './resources/en';
import { es } from './resources/es';
import { ptBr } from './resources/pt-BR';

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  },
  'pt-BR': {
    translation: ptBr
  }
} as const;

export function createI18nInstance(locale: Locale = defaultLocale) {
  const i18n = createInstance();
  const options: InitOptions = {
    resources,
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: supportedLocales,
    load: 'currentOnly',
    initAsync: false,
    interpolation: {
      escapeValue: false
    },
    returnNull: false
  };

  void i18n.use(initReactI18next).init(options);

  return i18n;
}
