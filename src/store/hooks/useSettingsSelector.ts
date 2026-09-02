/**
 * @file useSettingsSelector.ts
 * @description Strongly-typed Zustand store selector hooks for UISlice and Settings.
 * Optimizes performance by reducing React re-renders across setting changes.
 */

import { useSettingsStore } from '../settingsStore';
import { UISlice } from '../types';

export const useLayoutMode = () => useSettingsStore((s: UISlice) => s.layoutMode);
export const useNotificationSettings = () => useSettingsStore((s: UISlice) => s.notificationSettings);
export const useIsMinimized = () => useSettingsStore((s: UISlice) => s.isMinimized);
export const useMarketCurrencyPref = () => useSettingsStore((s: UISlice) => s.marketCurrencyPref);
export const useGlobalScale = () => useSettingsStore((s: UISlice) => s.globalScale);
export const useLanguage = () => useSettingsStore((s: UISlice) => s.language);
export const useTheme = () => useSettingsStore((s: UISlice) => s.theme);
export const usePoppedOutWindows = () => useSettingsStore((s: UISlice) => s.poppedOutWindows);
