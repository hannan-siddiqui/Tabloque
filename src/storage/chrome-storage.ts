import { TabloqueState } from '../types';
import { INITIAL_STATE } from './initial-data';

const STORAGE_KEY = 'tabloque_state_v1';

export const isChromeStorageAvailable = (): boolean => {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.storage &&
    !!chrome.storage.local
  );
};

/**
 * Loads current TabLoque state from chrome.storage.local or localStorage fallback.
 */
export async function loadStateFromStorage(): Promise<TabloqueState> {
  try {
    if (isChromeStorageAvailable()) {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      if (result && result[STORAGE_KEY]) {
        return {
          ...INITIAL_STATE,
          ...result[STORAGE_KEY],
        };
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return {
          ...INITIAL_STATE,
          ...JSON.parse(raw),
        };
      }
    }
  } catch (error) {
    console.error('[TabLoque Storage] Failed to load state:', error);
  }

  return INITIAL_STATE;
}

/**
 * Saves current TabLoque state to chrome.storage.local or localStorage fallback.
 */
export async function saveStateToStorage(state: TabloqueState): Promise<void> {
  try {
    if (isChromeStorageAvailable()) {
      await chrome.storage.local.set({ [STORAGE_KEY]: state });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error('[TabLoque Storage] Failed to save state:', error);
  }
}

/**
 * Subscribes to storage changes (e.g., triggered by background script shortcut).
 */
export function onStorageChange(callback: (newState: TabloqueState) => void): () => void {
  if (isChromeStorageAvailable()) {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
        callback(changes[STORAGE_KEY].newValue as TabloqueState);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }

  // Fallback for local storage window event
  if (typeof window !== 'undefined') {
    const listener = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          callback(JSON.parse(event.newValue));
        } catch (err) {
          console.error('[TabLoque Storage] Error parsing changed state:', err);
        }
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }

  return () => {};
}
