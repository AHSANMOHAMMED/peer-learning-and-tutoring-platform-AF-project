import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import si from './locales/si';
import ta from './locales/ta';

const i18n = new I18n({ en, si, ta });

// Supported languages with display metadata
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'si', label: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', label: 'தமிழ்', flag: '🇱🇰' },
] as const;

const LANGUAGE_KEY = '@peerlearn_language';

// Initialize — try saved preference first, then device locale, else English
export async function initializeLanguage(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && ['en', 'si', 'ta'].includes(saved)) {
      i18n.locale = saved;
      return saved;
    }
  } catch {}

  // Fallback: detect device locale
  const deviceLocale = Localization.locale?.split('-')[0] ?? 'en';
  const supported = ['en', 'si', 'ta'];
  i18n.locale = supported.includes(deviceLocale) ? deviceLocale : 'en';
  return i18n.locale;
}

// Change language and persist
export async function changeLanguage(code: string): Promise<void> {
  i18n.locale = code;
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
  } catch {}
}

// Convenience accessor
export function getCurrentLanguage(): string {
  return i18n.locale;
}

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
