import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Adresa de email nu este validă.");
// Aceleași reguli ca în client (utils/validation.ts)
export const newPassword = z
  .string()
  .min(8, "Parola trebuie să aibă minim 8 caractere.")
  .max(72, "Parola e prea lungă (maxim 72 de caractere).")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Parola trebuie să conțină litere și cifre.");
const name = z.string().trim().min(2, "Numele e prea scurt (minim 2 caractere).").max(50, "Numele e prea lung (maxim 50 de caractere).");

export const registerSchema = z.object({ name, email, password: newPassword });
export const loginSchema = z.object({ email, password: z.string().min(1, "Introdu parola.") });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const googleSchema = z.object({ idToken: z.string().min(1) });
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, "Codul trebuie să aibă 6 cifre."),
  password: newPassword,
});
export const updateMeSchema = z
  .object({
    name: name.optional(),
    currentPassword: z.string().optional(),
    password: newPassword.optional(),
  })
  .refine((v) => v.name || v.password, "Nimic de actualizat.");
