import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import bgTranslation from '@/locales/bg/translations.json';
import enTranslation from '@/locales/en/translations.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            bg: { translation: bgTranslation },
            en: { translation: enTranslation }
        },
        fallbackLng: 'bg',
        debug: false,
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;