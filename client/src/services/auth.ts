import { MOCK_AUTH } from "@/constants/config";
import { api, ApiError } from "@/services/api";
import { useAuthStore, type AuthUser } from "@/store/auth";

export type { AuthUser };
export type AuthResponse = { user: AuthUser; token: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mockAuth(email: string, name?: string): Promise<AuthResponse> {
  await wait(700);
  return {
    user: { id: "demo", email, name: name ?? email.split("@")[0] },
    token: "demo-token",
  };
}

// După login/register salvăm sesiunea în store (+ expo-secure-store); gardul de rute din _layout face restul.
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = MOCK_AUTH
    ? await mockAuth(email)
    : await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  await useAuthStore.getState().setSession(res.user, res.token);
  return res;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = MOCK_AUTH
    ? await mockAuth(email, name)
    : await api<AuthResponse>("/auth/register", { method: "POST", body: { name, email, password } });
  await useAuthStore.getState().setSession(res.user, res.token);
  return res;
}

export const logout = () => useAuthStore.getState().signOut();

// TODO: necesită Google Cloud (OAuth client IDs) + expo-auth-session; vezi explicațiile din chat.
export async function signInWithGoogle(): Promise<AuthResponse> {
  throw new ApiError(0, "NOT_IMPLEMENTED", "Autentificarea cu Google va fi disponibilă în curând.");
}

// Mesaje prietenoase în română pentru erorile frecvente.
export function authErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "Email sau parolă greșite.";
    if (e.status === 409) return "Există deja un cont cu acest email.";
    if (e.status === 429) return "Prea multe încercări. Așteaptă puțin și încearcă din nou.";
    return e.message;
  }
  return "A apărut o eroare. Încearcă din nou.";
}
