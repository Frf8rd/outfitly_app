import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { verifyAccessToken } from "../utils/tokens.js";

// Verifică "Authorization: Bearer <accessToken>" și pune req.user.
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "UNAUTHENTICATED", "Nu ești autentificat.");

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (e) {
      const expired = e.name === "TokenExpiredError";
      throw new HttpError(401, expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN", "Sesiunea a expirat.");
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, "INVALID_TOKEN", "Contul nu mai există.");
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}
