import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'es' | 'en' | 'pt';
export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  lang: Lang;
  themeMode: ThemeMode;
  setLang: (lang: Lang) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'es',
      themeMode: 'system',
      setLang: (lang) => set({ lang }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: 'loyal-settings',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
