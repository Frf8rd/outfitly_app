// Validări pentru formulare. Fiecare funcție întoarce mesajul de eroare sau undefined dacă e ok.
// Serverul trebuie să aplice aceleași reguli (zod), clientul doar ajută utilizatorul.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Introdu numele tău.";
  if (v.length < 2) return "Numele e prea scurt (minim 2 caractere).";
  if (v.length > 50) return "Numele e prea lung (maxim 50 de caractere).";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Introdu adresa de email.";
  if (!EMAIL_RE.test(v)) return "Adresa de email nu este validă.";
  return undefined;
}

// La înregistrare: reguli complete.
export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Introdu o parolă.";
  if (value.length < 8) return "Parola trebuie să aibă minim 8 caractere.";
  if (value.length > 72) return "Parola e prea lungă (maxim 72 de caractere).";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Parola trebuie să conțină litere și cifre.";
  return undefined;
}

// La login: doar să nu fie goală (conturile existente pot avea alte reguli).
export function validateLoginPassword(value: string): string | undefined {
  return value ? undefined : "Introdu parola.";
}