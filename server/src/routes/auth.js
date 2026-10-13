import { Router } from "express";
import * as c from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { forgotLimiter, loginLimiter, registerLimiter, resetLimiter } from "../middleware/rateLimit.js";
import { forgotSchema, googleSchema, loginSchema, refreshSchema, registerSchema, resetSchema } from "../validators/auth.schema.js";

const r = Router();
r.post("/register", registerLimiter, validate(registerSchema), c.register);
r.post("/login", loginLimiter, validate(loginSchema), c.login);
r.post("/google", loginLimiter, validate(googleSchema), c.google);
r.post("/refresh", validate(refreshSchema), c.refresh);
r.post("/logout", c.logout);
r.get("/me", requireAuth, c.me);
r.post("/forgot-password", forgotLimiter, validate(forgotSchema), c.forgotPassword);
r.post("/reset-password", resetLimiter, validate(resetSchema), c.resetPassword);
export default r;
