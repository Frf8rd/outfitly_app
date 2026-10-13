import rateLimit from "express-rate-limit";

const make = (windowMin, max, message) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: { code: "RATE_LIMITED", message } }),
  });

export const loginLimiter = make(15, 10, "Prea multe încercări. Încearcă din nou în 15 minute.");
export const registerLimiter = make(60, 20, "Prea multe conturi create. Încearcă mai târziu.");
export const forgotLimiter = make(60, 5, "Prea multe cereri de resetare. Încearcă mai târziu.");
export const resetLimiter = make(15, 10, "Prea multe încercări. Încearcă din nou în 15 minute.");
