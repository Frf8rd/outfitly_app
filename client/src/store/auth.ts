import { create } from "zustand";
import type { Style } from "@/types/models";
import { MOCK_AUTH } from "@/constants/config";
import { api, ApiError, setTokens, setTokensRefreshedHandler, setUnauthorizedHandler, type Tokens } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { clearSession, loadSession, saveSession } from "@/services/tokenStorage";
import { disableReminder } from "@/services/notifications";

// hasPassword = false la conturile create doar cu Google
export type AuthUser = { id: string; name: string; email: string; mainStyle?: Style | null; hasPassword?: boolean };

type AuthState = {
  // loading = încă citim sesiunea de pe telefon (la pornire)
  status: "loading" | "signedIn" | "signedOut";
  user: AuthUser | null;
  bootstrap: () => Promise<void>;
  setSession: (user: AuthUser, tokens: Tokens) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  signOut: () => Promise<void>;
};

let currentTokens: Tokens | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  user: null,

  // Se apelează o singură dată, la pornirea aplicației (în _layout.tsx).
  async bootstrap() {
    const session = await loadSession();
    if (!session) {
      set({ status: "signedOut", user: null });
      return;
    }
    currentTokens = { accessToken: session.accessToken, refreshToken: session.refreshToken };
    setTokens(currentTokens);
    set({ status: "signedIn", user: session.user as AuthUser });

    // Verificăm sesiunea pe server în fundal (api() reînnoiește tokenul dacă a expirat; dacă nu se poate -> logout).
    // Erorile de rețea le ignorăm: rămâi logat offline.
    if (!MOCK_AUTH) {
      try {
        const me = await api<{ user: AuthUser }>("/auth/me");
        set({ user: me.user });
        if (currentTokens) await saveSession({ ...currentTokens, user: me.user });
      } catch (e) {
        if (!(e instanceof ApiError)) return;
      }
    }
  },

  async setSession(user, tokens) {
    currentTokens = tokens;
    setTokens(tokens);
    await saveSession({ ...tokens, user });
    set({ status: "signedIn", user });
  },

  updateUser(patch) {
    const user = get().user;
    if (!user) return;
    const next = { ...user, ...patch };
    set({ user: next });
    if (currentTokens) void saveSession({ ...currentTokens, user: next });
  },

  async signOut() {
    const refreshToken = currentTokens?.refreshToken;
    currentTokens = null;
    // invalidăm sesiunea pe server (fără să blocăm deconectarea dacă nu avem net)
    if (refreshToken && !MOCK_AUTH) api("/auth/logout", { method: "POST", body: { refreshToken } }).catch(() => {});
    setTokens(null);
    await clearSession();
    void disableReminder(); // notificarea zilnică aparține contului care a ieșit
    queryClient.clear(); // să nu rămână în cache datele utilizatorului precedent
    set({ status: "signedOut", user: null });
  },
}));

// tokenuri reînnoite automat de api() -> le salvăm pe telefon
setTokensRefreshedHandler((tokens) => {
  currentTokens = tokens;
  const user = useAuthStore.getState().user;
  if (user) void saveSession({ ...tokens, user });
});

// sesiune care nu mai poate fi reînnoită = logout automat
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().status === "signedIn") void useAuthStore.getState().signOut();
});
