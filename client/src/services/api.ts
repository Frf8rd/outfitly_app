import { API_URL } from "@/constants/config";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type Tokens = { accessToken: string; refreshToken: string };

let tokens: Tokens | null = null;
export const setTokens = (t: Tokens | null) => {
  tokens = t;
};

// Apelat când sesiunea nu mai poate fi reînnoită (refresh token expirat/invalid) -> logout.
// Îl înregistrează store/auth.ts (așa evităm importul circular api <-> store).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

// Apelat după fiecare reînnoire reușită, ca store-ul să salveze noile tokenuri pe telefon.
let onTokensRefreshed: ((t: Tokens) => void) | null = null;
export const setTokensRefreshedHandler = (fn: ((t: Tokens) => void) | null) => {
  onTokensRefreshed = fn;
};

// Construiește query string-ul și sare peste valorile goale: qs({ category: "TOP", search: "" }) -> "?category=TOP"
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

async function request(path: string, { method = "GET", body }: Options, accessToken: string | null): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Nu mă pot conecta la server. Verifică internetul și încearcă din nou.");
  } finally {
    clearTimeout(timer);
  }
}

// Mai multe cereri 401 în paralel împart o singură reînnoire (refresh token-ul se rotește, nu poate fi folosit de 2 ori).
let refreshing: Promise<boolean> | null = null;
function refreshTokens(): Promise<boolean> {
  if (!tokens) return Promise.resolve(false);
  refreshing ??= (async () => {
    try {
      const res = await request("/auth/refresh", { method: "POST", body: { refreshToken: tokens!.refreshToken } }, null);
      if (!res.ok) return res.status >= 500 ? true : false; // server picat != sesiune invalidă
      const data = (await res.json()) as Tokens;
      tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
      onTokensRefreshed?.(tokens);
      return true;
    } catch {
      return true; // fără rețea: nu deconectăm utilizatorul
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

// Un singur loc pentru apeluri către server: token, JSON, timeout, reînnoire sesiune, erori uniforme.
export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const hadSession = tokens !== null;
  const sent = tokens?.accessToken ?? null;
  let res = await request(path, opts, sent);

  // access token expirat -> reînnoim o dată și repetăm cererea (nu pentru /auth/*: 401 acolo = parolă greșită etc.)
  if (res.status === 401 && hadSession && !path.startsWith("/auth/")) {
    const stillValid = await refreshTokens();
    if (stillValid && tokens && tokens.accessToken !== sent) res = await request(path, opts, tokens.accessToken);
    else if (!stillValid) onUnauthorized?.();
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && hadSession && !path.startsWith("/auth/")) onUnauthorized?.();
    throw new ApiError(
      res.status,
      data?.error?.code ?? "UNKNOWN",
      data?.error?.message ?? "A apărut o eroare. Încearcă din nou."
    );
  }
  return data as T;
}
