import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { wardrobeItemOut } from "../utils/serialize.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /wardrobe?category=  -> { items: WardrobeItem[] }
export const list = wrap(async (req, res) => {
  const { category } = req.validQuery;
  const rows = await prisma.wardrobeItem.findMany({
    where: { userId: req.user.id, ...(category && { catalogItem: { category } }) },
    include: { catalogItem: true },
    orderBy: { addedAt: "desc" },
  });
  res.json({ items: rows.map((r) => wardrobeItemOut(req, r)) });
});

// POST /wardrobe { catalogItemId } -> articolul adăugat (idempotent: dacă îl ai deja, îl întoarce pe cel existent)
export const add = wrap(async (req, res) => {
  const { catalogItemId } = req.body;
  if (!(await prisma.catalogItem.findUnique({ where: { id: catalogItemId }, select: { id: true } }))) {
    throw new HttpError(404, "NOT_FOUND", "Articolul nu există în catalog.");
  }
  const row = await prisma.wardrobeItem.upsert({
    where: { userId_catalogItemId: { userId: req.user.id, catalogItemId } },
    create: { userId: req.user.id, catalogItemId },
    update: {},
    include: { catalogItem: true },
  });
  res.status(201).json(wardrobeItemOut(req, row));
});

// POST /wardrobe/bulk { catalogItemIds } -> { added }
export const bulkAdd = wrap(async (req, res) => {
  const ids = [...new Set(req.body.catalogItemIds)];
  const existing = await prisma.catalogItem.findMany({ where: { id: { in: ids } }, select: { id: true } });
  if (existing.length !== ids.length) throw new HttpError(404, "NOT_FOUND", "Unele articole nu există în catalog.");
  const r = await prisma.wardrobeItem.createMany({
    data: ids.map((catalogItemId) => ({ userId: req.user.id, catalogItemId })),
    skipDuplicates: true,
  });
  res.status(201).json({ added: r.count });
});

// DELETE /wardrobe/:id  (doar propriile articole; ținutele care îl conțin îl pierd, vezi OutfitItem onDelete: Cascade)
export const remove = wrap(async (req, res) => {
  const r = await prisma.wardrobeItem.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  if (r.count === 0) throw new HttpError(404, "NOT_FOUND", "Articolul nu e în garderoba ta.");
  res.status(204).end();
});
