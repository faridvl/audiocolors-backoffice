import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationES from '@/static/texts/es.json';

const resources = {
  es: {
    translation: {
      ...translationES,
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
