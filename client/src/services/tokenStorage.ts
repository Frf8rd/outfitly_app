import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Sesiunea (token + user) stă criptat pe telefon. Pe web (expo start --web) SecureStore nu există,
// deci folosim localStorage doar ca să poți testa în browser.
const KEY = "stilora.session";

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; mainStyle?: string | null; hasPassword?: boolean };
};

export async function saveSession(session: StoredSession): Promise<void> {
  const value = JSON.stringify(session);
  try {
    if (Platform.OS === "web") localStorage.setItem(KEY, value);
    else await SecureStore.setItemAsync(KEY, value);
  } catch {
    // dacă nu se poate salva, utilizatorul rămâne logat doar până închide aplicația
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = Platform.OS === "web" ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.accessToken && parsed?.refreshToken && parsed?.user ? (parsed as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    if (Platform.OS === "web") localStorage.removeItem(KEY);
    else await SecureStore.deleteItemAsync(KEY);
  } catch {}
}
