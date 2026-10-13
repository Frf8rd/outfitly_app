import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { catalogItemOut } from "../utils/serialize.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /catalog?category=&color=&style=&search=&page=&limit=  -> { items, page, limit, total }
export const list = wrap(async (req, res) => {
  const { category, color, style, search, page, limit } = req.validQuery;
  const where = {
    ...(category && { category }),
    ...(style && { styles: { has: style } }),
    ...(color && { color: { equals: color, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { subtype: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const [total, rows, owned] = await Promise.all([
    prisma.catalogItem.count({ where }),
    prisma.catalogItem.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }], skip: (page - 1) * limit, take: limit }),
    prisma.wardrobeItem.findMany({ where: { userId: req.user.id }, select: { catalogItemId: true } }),
  ]);
  const ownedIds = new Set(owned.map((o) => o.catalogItemId));
  res.json({ items: rows.map((r) => catalogItemOut(req, r, ownedIds.has(r.id))), page, limit, total });
});

export const getOne = wrap(async (req, res) => {
  const item = await prisma.catalogItem.findUnique({ where: { id: req.params.id } });
  if (!item) throw new HttpError(404, "NOT_FOUND", "Articolul nu există.");
  const owned = !!(await prisma.wardrobeItem.findUnique({
    where: { userId_catalogItemId: { userId: req.user.id, catalogItemId: item.id } },
  }));
  res.json(catalogItemOut(req, item, owned));
});
