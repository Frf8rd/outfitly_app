import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { issueSession, publicUser } from "../utils/tokens.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// PATCH /users/me  { name? } sau { currentPassword, password }
export const updateMe = wrap(async (req, res) => {
  const { name, currentPassword, password } = req.body;
  const u = req.user;
  const data = {};
  if (name) data.name = name;
  if (password) {
    // conturile Google fără parolă își pot seta una fără parola actuală
    if (u.passwordHash && !(currentPassword && (await bcrypt.compare(currentPassword, u.passwordHash)))) {
      throw new HttpError(400, "WRONG_PASSWORD", "Parola actuală e greșită.");
    }
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({ where: { id: u.id }, data });
  if (password) {
    // după schimbarea parolei, închide celelalte sesiuni și dă una nouă acestui dispozitiv
    await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
    return res.json(await issueSession(user));
  }
  res.json({ user: publicUser(user) });
});

// DELETE /users/me  (cerut de Google Play / App Store). Cascade șterge garderoba, ținutele etc.
export const deleteMe = wrap(async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  res.status(204).end();
});

// Stilul principal = cel mai frecvent răspuns; la egalitate câștigă primul întâlnit (la fel ca în aplicație).
export function computeMainStyle(answers) {
  const counts = new Map();
  for (const a of answers) counts.set(a, (counts.get(a) ?? 0) + 1);
  let best = null;
  for (const [style, n] of counts) if (best === null || n > counts.get(best)) best = style;
  return best;
}

// PUT /users/me/style-quiz { answers: Style[] } -> { user }
export const saveStyleQuiz = wrap(async (req, res) => {
  const { answers } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { mainStyle: computeMainStyle(answers), quizAnswers: answers },
  });
  res.json({ user: publicUser(user) });
});
