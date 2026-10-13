import { prisma } from "../config/db.js";
import { OUTFIT_INCLUDE, outfitOut } from "../utils/serialize.js";

// GET /wear-logs?from=2026-10-12T00:00:00Z&to=...  -> { items: [{ id, wornOn, outfit }] }  (jurnalul „Am purtat asta”)
export const list = async (req, res, next) => {
  try {
    const { from, to } = req.validQuery;
    const rows = await prisma.wearLog.findMany({
      where: { userId: req.user.id, ...((from || to) && { wornOn: { ...(from && { gte: from }), ...(to && { lte: to }) } }) },
      include: { outfit: { include: OUTFIT_INCLUDE } },
      orderBy: { wornOn: "desc" },
      take: 200,
    });
    res.json({ items: rows.map((l) => ({ id: l.id, wornOn: l.wornOn, outfit: outfitOut(req, l.outfit) })) });
  } catch (e) {
    next(e);
  }
};
