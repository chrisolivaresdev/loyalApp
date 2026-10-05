import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'loyal.auth.token';

let memory: string | null = null;
let pending: Promise<string | null> | null = null;

const readPersisted = (): Promise<string | null> =>
  Platform.OS === 'web'
    ? Promise.resolve(localStorage.getItem(KEY))
    : AsyncStorage.getItem(KEY);

/**
 * Token JWT para Authorization: Bearer. La cookie httpOnly no viaja en XHR
 * cuando la app web y el API están en hosts distintos (cross-site), así que el
 * token también se guarda localmente y se adjunta como header.
 */
export const getAuthToken = (): Promise<string | null> => {
  pending ??= readPersisted().then((v) => (memory = v));
  return pending;
};

export const setAuthToken = (token: string | null): void => {
  memory = token;
  pending = Promise.resolve(token);
  if (Platform.OS === 'web') {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } else {
    if (token) void AsyncStorage.setItem(KEY, token);
    else void AsyncStorage.removeItem(KEY);
  }
};
