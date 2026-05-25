import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
  USER_ID: 'auth.userId',
} as const;

async function set(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function get(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function remove(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = {
  setAccessToken: (token: string) => set(KEYS.ACCESS_TOKEN, token),
  getAccessToken: () => get(KEYS.ACCESS_TOKEN),
  removeAccessToken: () => remove(KEYS.ACCESS_TOKEN),

  setRefreshToken: (token: string) => set(KEYS.REFRESH_TOKEN, token),
  getRefreshToken: () => get(KEYS.REFRESH_TOKEN),
  removeRefreshToken: () => remove(KEYS.REFRESH_TOKEN),

  setUserId: (id: string) => set(KEYS.USER_ID, id),
  getUserId: () => get(KEYS.USER_ID),
  removeUserId: () => remove(KEYS.USER_ID),

  async clearAll(): Promise<void> {
    await Promise.all([
      remove(KEYS.ACCESS_TOKEN),
      remove(KEYS.REFRESH_TOKEN),
      remove(KEYS.USER_ID),
    ]);
  },
};
