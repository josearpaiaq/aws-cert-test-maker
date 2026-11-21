import * as SecureStore from 'expo-secure-store';

import type { TokenStore } from './session';

const KEY = 'cloudprep.refresh-token';

/** Keychain on iOS, Keystore-backed storage on Android. Excluded from Android backups. */
export const secureTokenStore: TokenStore = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
