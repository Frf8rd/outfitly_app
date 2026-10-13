import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { issueSession, publicUser, sha256 } from "../utils/tokens.js";
import { sendResetCodeEmail } from "../services/email.service.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const BAD_LOGIN = new HttpError(401, "INVALID_CREDENTIALS", "Email sau parolă greșite.");
// hash fals ca login-ul să dureze la fel și când emailul nu există (anti user-enumeration)
const DUMMY_HASH = bcrypt.hashSync("dummy-password-1", 10);

export const register = wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, "EMAIL_TAKEN", "Există deja un cont cu acest email.");
  }
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), lastLoginAt: new Date() },
  });
  res.status(201).json(await issueSession(user));
});

export const login = wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.passwordHash || !ok) throw BAD_LOGIN;
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  res.json(await issueSession(user));
});

// Google: aplicația obține un idToken (expo-auth-session), serverul îl verifică.
export const google = wrap(async (req, res) => {
  const audiences = [
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
  ].filter(Boolean);
  if (!audiences.length) throw new HttpError(503, "GOOGLE_NOT_CONFIGURED", "Autentificarea cu Google nu e configurată.");

  let p;
  try {
    const ticket = await new OAuth2Client().verifyIdToken({ idToken: req.body.idToken, audience: audiences });
    p = ticket.getPayload();
  } catch {
    throw new HttpError(401, "INVALID_GOOGLE_TOKEN", "Autentificarea cu Google a eșuat.");
  }
  if (!p?.email || !p.email_verified) throw new HttpError(401, "INVALID_GOOGLE_TOKEN", "Emailul Google nu e verificat.");

  const email = p.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { googleId: p.sub } });
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    user = byEmail
      ? await prisma.user.update({ where: { id: byEmail.id }, data: { googleId: p.sub } }) // leagă contul existent
      : await prisma.user.create({ data: { email, googleId: p.sub, name: p.name || email.split("@")[0] } });
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  res.json(await issueSession(user));
});

// Rotație: tokenul vechi se șterge, se emite unul nou. Token necunoscut/expirat -> 401.
export const refresh = wrap(async (req, res) => {
  const hash = sha256(req.body.refreshToken);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: hash }, include: { user: true } });
  if (!row || row.expiresAt < new Date()) {
    if (row) await prisma.refreshToken.delete({ where: { id: row.id } });
    throw new HttpError(401, "INVALID_REFRESH", "Sesiunea a expirat. Autentifică-te din nou.");
  }
  await prisma.refreshToken.delete({ where: { id: row.id } });
  res.json(await issueSession(row.user));
});

export const logout = wrap(async (req, res) => {
  const token = req.body?.refreshToken;
  if (token) await prisma.refreshToken.deleteMany({ where: { tokenHash: sha256(String(token)) } });
  res.status(204).end();
});

export const me = wrap(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Răspuns identic indiferent dacă emailul există (anti user-enumeration).
export const forgotPassword = wrap(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user) {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetCodeHash: sha256(`${user.id}:${code}`), resetCodeExpires: new Date(Date.now() + 10 * 60_000), resetAttempts: 0 },
    });
    try {
      await sendResetCodeEmail(user, code);
    } catch (e) {
      console.error("Trimiterea emailului de resetare a eșuat:", e.message);
    }
  }
  res.json({ message: "Dacă există un cont cu acest email, ți-am trimis un cod de resetare." });
});

export const resetPassword = wrap(async (req, res) => {
  const { email, code, password } = req.body;
  const invalid = new HttpError(400, "INVALID_CODE", "Codul e greșit sau a expirat.");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.resetCodeHash || !user.resetCodeExpires || user.resetCodeExpires < new Date() || user.resetAttempts >= 5) {
    throw invalid;
  }
  const given = Buffer.from(sha256(`${user.id}:${code}`));
  const real = Buffer.from(user.resetCodeHash);
  if (!crypto.timingSafeEqual(given, real)) {
    await prisma.user.update({ where: { id: user.id }, data: { resetAttempts: { increment: 1 } } });
    throw invalid;
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(password, 10), resetCodeHash: null, resetCodeExpires: null, resetAttempts: 0 },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }), // deconectează toate dispozitivele
  ]);
  res.json({ message: "Parola a fost schimbată. Te poți autentifica." });
});
