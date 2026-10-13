import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { OUTFIT_INCLUDE, outfitOut } from "../utils/serialize.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const notFound = () => new HttpError(404, "NOT_FOUND", "Ținuta nu există.");

// Toate articolele trebuie să fie din garderoba utilizatorului curent (altfel i-ai putea folosi hainele altcuiva).
async function assertOwnsItems(userId, ids) {
  const unique = [...new Set(ids)];
  const count = await prisma.wardrobeItem.count({ where: { userId, id: { in: unique } } });
  if (count !== unique.length) throw new HttpError(400, "INVALID_ITEMS", "Unele articole nu sunt în garderoba ta.");
  return unique;
}

const findOwn = (req) => prisma.outfit.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: OUTFIT_INCLUDE });

// GET /outfits?favorite=true&occasion=SCHOOL -> { items: Outfit[] }
export const list = wrap(async (req, res) => {
  const { favorite, occasion } = req.validQuery;
  const rows = await prisma.outfit.findMany({
    where: { userId: req.user.id, ...(favorite && { isFavorite: favorite === "true" }), ...(occasion && { occasion }) },
    include: OUTFIT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  res.json({ items: rows.map((o) => outfitOut(req, o)) });
});

export const getOne = wrap(async (req, res) => {
  const o = await findOwn(req);
  if (!o) throw notFound();
  res.json(outfitOut(req, o));
});

export const create = wrap(async (req, res) => {
  const { name, occasion, source, isFavorite, wardrobeItemIds } = req.body;
  const ids = await assertOwnsItems(req.user.id, wardrobeItemIds);
  const o = await prisma.outfit.create({
    data: {
      userId: req.user.id, name, occasion, source, isFavorite,
      items: { create: ids.map((wardrobeItemId) => ({ wardrobeItemId })) },
    },
    include: OUTFIT_INCLUDE,
  });
  res.status(201).json(outfitOut(req, o));
});

// PATCH /outfits/:id { name?, occasion?, isFavorite?, wardrobeItemIds? } (lista de articole se înlocuiește)
export const update = wrap(async (req, res) => {
  const existing = await prisma.outfit.findFirst({ where: { id: req.params.id, userId: req.user.id }, select: { id: true } });
  if (!existing) throw notFound();
  const { wardrobeItemIds, ...fields } = req.body;
  const ids = wardrobeItemIds ? await assertOwnsItems(req.user.id, wardrobeItemIds) : null;

  const o = await prisma.$transaction(async (tx) => {
    if (ids) {
      await tx.outfitItem.deleteMany({ where: { outfitId: existing.id } });
      await tx.outfitItem.createMany({ data: ids.map((wardrobeItemId) => ({ outfitId: existing.id, wardrobeItemId })) });
    }
    return tx.outfit.update({ where: { id: existing.id }, data: fields, include: OUTFIT_INCLUDE });
  });
  res.json(outfitOut(req, o));
});

export const remove = wrap(async (req, res) => {
  const r = await prisma.outfit.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  if (r.count === 0) throw notFound();
  res.status(204).end();
});

// POST /outfits/:id/wear -> marchează ținuta ca purtată azi (alimentează statisticile și evitarea repetițiilor)
export const wear = wrap(async (req, res) => {
  const existing = await prisma.outfit.findFirst({ where: { id: req.params.id, userId: req.user.id }, select: { id: true } });
  if (!existing) throw notFound();
  const log = await prisma.wearLog.create({ data: { userId: req.user.id, outfitId: existing.id } });
  res.status(201).json({ id: log.id, wornOn: log.wornOn });
});
