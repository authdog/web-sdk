/**
 * Pluggable, asynchronous token storage.
 *
 * Unlike the browser SDKs (which can read `localStorage` synchronously), mobile
 * secure storage is always asynchronous. The SDK therefore talks to storage
 * exclusively through this async interface so any backing store can be used:
 * `expo-secure-store`, `@react-native-async-storage/async-storage`, the
 * Keychain/Keystore, etc.
 *
 * For real apps you SHOULD use a hardware-backed secure store
 * (`expo-secure-store`) so the session token is encrypted at rest rather than
 * sitting in plain AsyncStorage.
 */
export interface AuthdogStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Minimal in-memory storage. Intended as a safe default and for tests — the
 * token does NOT survive an app restart and is NOT encrypted at rest. Provide
 * a real `AuthdogStorage` (e.g. via {@link createSecureStoreAdapter}) in
 * production.
 */
export const inMemoryStorage = (): AuthdogStorage => {
  const store = new Map<string, string>();
  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
  };
};

/**
 * The subset of the `expo-secure-store` module the adapter relies on. Declared
 * structurally so this package never has to depend on Expo directly.
 */
export interface SecureStoreLike {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}

/**
 * Adapts the `expo-secure-store` module to {@link AuthdogStorage}.
 *
 * @example
 * import * as SecureStore from "expo-secure-store";
 * import { createSecureStoreAdapter } from "@authdog/react-native";
 *
 * const storage = createSecureStoreAdapter(SecureStore);
 */
export const createSecureStoreAdapter = (
  secureStore: SecureStoreLike,
): AuthdogStorage => ({
  getItem: (key) => secureStore.getItemAsync(key),
  setItem: (key, value) => secureStore.setItemAsync(key, value),
  removeItem: (key) => secureStore.deleteItemAsync(key),
});
