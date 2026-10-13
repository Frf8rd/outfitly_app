import { prisma } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";
import { wardrobeItemOut } from "../utils/serialize.js";
import { getWeather } from "../services/weather.service.js";
import { buildCandidates, keyOf, outfitName, pickSurprise, pickToday, rng } from "../services/outfitSuggestion.service.js";

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

const NOT_ENOUGH = () =>
  new HttpError(422, "NOT_ENOUGH_ITEMS", "Adaugă în garderobă cel puțin un top și un pantalon sau o fustă (sau o rochie) ca să-ți pot sugera o ținută.");

// piesele purtate în ultimele 14 zile -> câte zile au trecut (minimul, dacă a fost purtată de mai multe ori)
async function recentlyWorn(userId) {
  const since = new Date(Date.now() - 14 * 864e5);
  const logs = await prisma.wearLog.findMany({
    where: { userId, wornOn: { gte: since } },
    select: { wornOn: true, outfit: { select: { items: { select: { wardrobeItemId: true } } } } },
  });
  const map = new Map();
  for (const l of logs) {
    const days = Math.floor((Date.now() - l.wornOn.getTime()) / 864e5);
    for (const i of l.outfit.items) map.set(i.wardrobeItemId, Math.min(days, map.get(i.wardrobeItemId) ?? 99));
  }
  return map;
}

async function safeWeather(lat, lon) {
  if (lat === undefined || lon === undefined) return null;
  try {
    return await getWeather(lat, lon);
  } catch (e) {
    console.error("weather (ignorat):", e.message); // fără vreme, sugerăm doar după stil și culori
    return null;
  }
}

const out = (req, picked, occasion, weather) => ({
  key: keyOf(picked.items),
  name: outfitName(occasion),
  occasion,
  weather,
  items: picked.items.map((w) => wardrobeItemOut(req, w)),
});

async function load(req, occasion, weather, rand) {
  const wardrobe = await prisma.wardrobeItem.findMany({ where: { userId: req.user.id }, include: { catalogItem: true } });
  const candidates = buildCandidates(wardrobe, {
    occasion,
    weather,
    mainStyle: req.user.mainStyle,
    wornDaysAgo: await recentlyWorn(req.user.id),
    rand,
  });
  if (!candidates?.length) throw NOT_ENOUGH();
  return candidates;
}

// GET /suggestions/today?occasion=WORK&lat=&lon=&variant=0
export const today = wrap(async (req, res) => {
  const { occasion, lat, lon, variant } = req.validQuery;
  const weather = await safeWeather(lat, lon);
  const day = new Date().toISOString().slice(0, 10);
  const candidates = await load(req, occasion, weather, rng(`${req.user.id}|${day}|${occasion}`));
  res.json(out(req, pickToday(candidates, variant), occasion, weather));
});

// POST /suggestions/surprise { occasion?, previousKeys? }
export const surprise = wrap(async (req, res) => {
  const { occasion, previousKeys } = req.body;
  const candidates = await load(req, occasion, null, Math.random);
  res.json(out(req, pickSurprise(candidates, previousKeys), occasion, null));
});
