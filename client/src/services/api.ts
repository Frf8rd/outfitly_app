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

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Apelat când serverul răspunde 401 cu un token activ (token expirat/invalid).
// Îl înregistrează store/auth.ts (așa evităm importul circular api <-> store).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

// Construiește query string-ul și sare peste valorile goale: qs({ category: "TOP", search: "" }) -> "?category=TOP"
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

// Un singur loc pentru apeluri către server: token, JSON, timeout, erori uniforme.
export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const hadToken = authToken !== null;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Nu mă pot conecta la server. Verifică internetul și încearcă din nou.");
  } finally {
    clearTimeout(timer);
  }

  // 204 No Content (ex. DELETE) nu are body
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    // 401 pe /auth/login înseamnă „parolă greșită", nu „sesiune expirată" -> logout automat doar dacă aveam token
    if (res.status === 401 && hadToken) onUnauthorized?.();
    throw new ApiError(
      res.status,
      data?.error?.code ?? "UNKNOWN",
      data?.error?.message ?? "A apărut o eroare. Încearcă din nou."
    );
  }
  return data as T;
}
