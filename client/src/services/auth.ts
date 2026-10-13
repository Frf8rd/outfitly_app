import { MOCK_AUTH } from "@/constants/config";
import { api, ApiError } from "@/services/api";
import { useAuthStore, type AuthUser } from "@/store/auth";

export type { AuthUser };
export type AuthResponse = { user: AuthUser; accessToken: string; refreshToken: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mockAuth(email: string, name?: string): Promise<AuthResponse> {
  await wait(700);
  return {
    user: { id: "demo", email, name: name ?? email.split("@")[0] },
    accessToken: "demo-token",
    refreshToken: "demo-refresh",
  };
}

async function startSession(res: AuthResponse) {
  await useAuthStore.getState().setSession(res.user, { accessToken: res.accessToken, refreshToken: res.refreshToken });
  return res;
}

// După login/register salvăm sesiunea în store (+ expo-secure-store); gardul de rute din _layout face restul.
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = MOCK_AUTH
    ? await mockAuth(email)
    : await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  return startSession(res);
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = MOCK_AUTH
    ? await mockAuth(email, name)
    : await api<AuthResponse>("/auth/register", { method: "POST", body: { name, email, password } });
  return startSession(res);
}

// idToken-ul vine din services/google.ts (expo-auth-session); serverul îl verifică la Google.
export async function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  const res = MOCK_AUTH ? await mockAuth("google@demo.com", "Google") : await api<AuthResponse>("/auth/google", { method: "POST", body: { idToken } });
  return startSession(res);
}

export async function forgotPassword(email: string): Promise<void> {
  if (MOCK_AUTH) return void (await wait(500));
  await api("/auth/forgot-password", { method: "POST", body: { email } });
}

export async function resetPassword(email: string, code: string, password: string): Promise<void> {
  if (MOCK_AUTH) return void (await wait(500));
  await api("/auth/reset-password", { method: "POST", body: { email, code, password } });
}

// Setări cont: nume / parolă / ștergere cont
export async function updateName(name: string): Promise<void> {
  if (!MOCK_AUTH) await api("/users/me", { method: "PATCH", body: { name } });
  useAuthStore.getState().updateUser({ name });
}

export async function changePassword(currentPassword: string, password: string): Promise<void> {
  if (MOCK_AUTH) return void (await wait(400));
  // serverul închide celelalte sesiuni și întoarce una nouă pentru acest telefon
  const res = await api<AuthResponse>("/users/me", { method: "PATCH", body: { currentPassword, password } });
  await startSession(res);
}

export async function deleteAccount(): Promise<void> {
  if (!MOCK_AUTH) await api("/users/me", { method: "DELETE" });
  await useAuthStore.getState().signOut();
}

export const logout = () => useAuthStore.getState().signOut();

// Mesaje prietenoase în română pentru erorile frecvente.
export function authErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.code === "INVALID_CREDENTIALS") return "Email sau parolă greșite.";
    if (e.status === 409) return "Există deja un cont cu acest email.";
    if (e.status === 429) return "Prea multe încercări. Așteaptă puțin și încearcă din nou.";
    return e.message;
  }
  return "A apărut o eroare. Încearcă din nou.";
}
