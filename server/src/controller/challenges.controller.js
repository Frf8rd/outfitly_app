import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { challengeOut, ensureChallenges } from "../services/challenges.service.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /challenges/current -> { items }: cele din săptămâna curentă, următoarea, plus cele finalizate de tine
export const current = wrap(async (req, res) => {
  const now = new Date();
  await ensureChallenges(now);
  const userId = req.user.id;
  const [open, done] = await Promise.all([
    prisma.challenge.findMany({ where: { endsAt: { gte: now } }, orderBy: { startsAt: "asc" } }),
    prisma.userChallenge.findMany({
      where: { userId, status: "COMPLETED", challenge: { endsAt: { lt: now } } },
      include: { challenge: true },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
  ]);
  const mine = await prisma.userChallenge.findMany({ where: { userId, challengeId: { in: open.map((c) => c.id) } } });
  const byId = new Map(mine.map((u) => [u.challengeId, u]));
  res.json({
    items: [...open.map((c) => challengeOut(c, byId.get(c.id), now)), ...done.map((u) => challengeOut(u.challenge, u, now))],
  });
});

async function findChallenge(id) {
  const c = await prisma.challenge.findUnique({ where: { id } });
  if (!c) throw new HttpError(404, "NOT_FOUND", "Provocarea nu există.");
  return c;
}

// POST /challenges/:id/join (idempotent)
export const join = wrap(async (req, res) => {
  const c = await findChallenge(req.params.id);
  const now = new Date();
  if (c.endsAt < now) throw new HttpError(409, "ENDED", "Provocarea s-a încheiat.");
  if (c.startsAt > now) throw new HttpError(409, "NOT_STARTED", "Provocarea nu a început încă.");
  const uc = await prisma.userChallenge.upsert({
    where: { userId_challengeId: { userId: req.user.id, challengeId: c.id } },
    create: { userId: req.user.id, challengeId: c.id },
    update: {},
  });
  res.status(201).json(challengeOut(c, uc, now));
});

// POST /challenges/:id/complete (idempotent)
export const complete = wrap(async (req, res) => {
  const c = await findChallenge(req.params.id);
  const key = { userId_challengeId: { userId: req.user.id, challengeId: c.id } };
  const existing = await prisma.userChallenge.findUnique({ where: key });
  if (!existing) throw new HttpError(409, "NOT_JOINED", "Alătură-te provocării înainte să o finalizezi.");
  const now = new Date();
  if (existing.status === "COMPLETED") return res.json(challengeOut(c, existing, now));
  if (c.endsAt < now) throw new HttpError(409, "ENDED", "Provocarea s-a încheiat.");
  const uc = await prisma.userChallenge.update({ where: key, data: { status: "COMPLETED", completedAt: now } });
  res.json(challengeOut(c, uc, now));
});
