import { create } from "zustand";
import { MOCK_AUTH } from "@/constants/config";
import { api, ApiError, setAuthToken, setUnauthorizedHandler } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { clearSession, loadSession, saveSession } from "@/services/tokenStorage";

export type AuthUser = { id: string; name: string; email: string };

type AuthState = {
  // loading = încă citim sesiunea de pe telefon (la pornire)
  status: "loading" | "signedOut" | "signedIn";
  user: AuthUser | null;
  bootstrap: () => Promise<void>;
  setSession: (user: AuthUser, token: string) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  signOut: () => Promise<void>;
};

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
    setAuthToken(session.token);
    set({ status: "signedIn", user: session.user });

    // Verificăm tokenul pe server în fundal. 401 -> api() face deja logout; erorile de rețea le ignorăm (rămâi logat offline).
    if (!MOCK_AUTH) {
      try {
        const me = await api<{ user: AuthUser }>("/auth/me");
        set({ user: me.user });
        await saveSession({ token: session.token, user: me.user });
      } catch (e) {
        if (!(e instanceof ApiError)) return;
      }
    }
  },

  async setSession(user, token) {
    setAuthToken(token);
    await saveSession({ token, user });
    set({ status: "signedIn", user });
  },

  updateUser(patch) {
    const user = get().user;
    if (user) set({ user: { ...user, ...patch } });
  },

  async signOut() {
    setAuthToken(null);
    await clearSession();
    queryClient.clear(); // să nu rămână în cache datele utilizatorului precedent
    set({ status: "signedOut", user: null });
  },
}));

// 401 de la server cu token activ = sesiune expirată -> logout automat
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().status === "signedIn") void useAuthStore.getState().signOut();
});
