import { prisma } from "../config/db.js";

// GET /stats -> { wardrobeCount, outfitCount, unwornCount, wornOutfitCount }
export const get = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const since = new Date(Date.now() - 30 * 864e5);
    const [wardrobeCount, outfitCount, worn, unwornCount] = await Promise.all([
      prisma.wardrobeItem.count({ where: { userId } }),
      prisma.outfit.count({ where: { userId } }),
      prisma.wearLog.groupBy({ by: ["outfitId"], where: { userId } }),
      // haine care nu apar în nicio ținută purtată în ultimele 30 de zile
      prisma.wardrobeItem.count({
        where: { userId, NOT: { outfitItems: { some: { outfit: { wearLogs: { some: { wornOn: { gte: since } } } } } } } },
      }),
    ]);
    res.json({ wardrobeCount, outfitCount, unwornCount, wornOutfitCount: worn.length });
  } catch (e) {
    next(e);
  }
};
