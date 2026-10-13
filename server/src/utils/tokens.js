import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const ACCESS_TTL = "15m";
const REFRESH_DAYS = 30;

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error("Lipsește JWT_SECRET din server/.env");
  return process.env.JWT_SECRET;
};

export const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");

export const signAccessToken = (userId) => jwt.sign({ sub: userId }, secret(), { expiresIn: ACCESS_TTL });
export const verifyAccessToken = (token) => jwt.verify(token, secret());

// Refresh token opac (random), salvat în DB doar ca hash. Se rotește la fiecare folosire.
export async function issueRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  await prisma.refreshToken.create({
    data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + REFRESH_DAYS * 864e5) },
  });
  return token;
}

export async function issueSession(user) {
  return {
    user: publicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: await issueRefreshToken(user.id),
  };
}

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  mainStyle: u.mainStyle ?? null,
  hasPassword: !!u.passwordHash,
});
