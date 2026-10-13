// Reguli de scor pentru ținute. Fără AI: alegem piese bune una câte una, apoi punctăm combinația.
// Scor total = vreme + stil/ocazie + culori + penalizare pentru piese purtate recent (+ puțin noroc).

const NEUTRALS = new Set(["negru", "alb", "gri", "bej", "crem"]);

// ce stiluri se potrivesc cu fiecare ocazie
const OCCASION_STYLES = {
  EVERYDAY: ["CASUAL"],
  SCHOOL: ["CASUAL", "STREETWEAR", "SPORT"],
  WORK: ["ELEGANT", "CASUAL"],
  DATE: ["ELEGANT", "COQUETTE"],
  PARTY: ["ELEGANT", "STREETWEAR", "COQUETTE"],
  VACATION: ["CASUAL", "SPORT"],
};

const OCCASION_NAME = {
  EVERYDAY: "Look zilnic",
  SCHOOL: "Look de școală",
  WORK: "Office look",
  DATE: "Look de întâlnire",
  PARTY: "Look de petrecere",
  VACATION: "Look de vacanță",
};

// Cât de "gros" ar trebui să fie un articol de bază (1..5) la temperatura dată
const idealWarmth = (t) => (t >= 27 ? 1 : t >= 21 ? 1.5 : t >= 15 ? 2 : t >= 8 ? 3 : t >= 1 ? 4 : 5);

// mulberry32: generator pseudo-aleator cu seed, ca "ținuta zilei" să nu se schimbe la fiecare deschidere
function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353) << 13 | h >>> 19;
  let a = (h = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function itemScore(w, ctx) {
  const c = w.catalogItem;
  let s = 0;

  // vreme
  if (ctx.weather) {
    const { temperature: t, condition } = ctx.weather;
    const target = idealWarmth(t) + (c.category === "OUTERWEAR" ? 1 : 0);
    s += 3 - Math.abs(c.warmth - target) * 1.2;
    if (c.category === "SHOES" && (condition === "rain" || condition === "snow")) s += c.waterproof ? 2.5 : -1;
    if (c.category === "OUTERWEAR" && condition === "rain") s += c.waterproof ? 2.5 : 0;
  }

  // stil + ocazie
  const occ = OCCASION_STYLES[ctx.occasion] ?? [];
  s += c.styles.filter((x) => occ.includes(x)).length * 1.5;
  if (ctx.mainStyle && c.styles.includes(ctx.mainStyle)) s += 1;

  // evită ce ai purtat recent
  const days = ctx.wornDaysAgo.get(w.id);
  if (days !== undefined) s -= days <= 2 ? 4 : days <= 7 ? 2 : 0.5;

  return s;
}

function colorScore(items) {
  const colored = new Set(items.map((w) => w.catalogItem.color).filter((c) => !NEUTRALS.has(c)));
  if (colored.size === 0) return 2; // totul neutru
  if (colored.size === 1) return 1.5; // o singură culoare + neutre
  if (colored.size === 2) return -1;
  return -3;
}

const top = (arr, n, scoreOf) => [...arr].sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, n);

// Toate combinațiile rezonabile, cu scor. Aruncă null dacă garderoba nu permite nicio ținută.
export function buildCandidates(wardrobe, ctx) {
  const by = (cat) => wardrobe.filter((w) => w.catalogItem.category === cat);
  const score = new Map(wardrobe.map((w) => [w.id, itemScore(w, ctx)]));
  const sc = (w) => score.get(w.id);

  const tops = top(by("TOP"), 4, sc);
  const bottoms = top(by("BOTTOM"), 4, sc);
  const dresses = top(by("DRESS"), 4, sc);
  const shoes = top(by("SHOES"), 3, sc);
  const outers = top(by("OUTERWEAR"), 3, sc);
  const accs = top(by("ACCESSORY"), 3, sc);

  const bases = [...dresses.map((d) => [d]), ...tops.flatMap((t) => bottoms.map((b) => [t, b]))];
  if (bases.length === 0) return null;

  const t = ctx.weather?.temperature;
  const wet = ctx.weather && (ctx.weather.condition === "rain" || ctx.weather.condition === "snow");
  const needsOuter = ctx.weather ? t < 16 || wet : false;
  const noOuter = ctx.weather ? t >= 23 && !wet : false;

  const shoeOpts = shoes.length ? shoes.map((s) => [s]) : [[]];
  const outerOpts = noOuter ? [[]] : needsOuter && outers.length ? outers.map((o) => [o]) : [[], ...outers.map((o) => [o])];
  const accOpts = [[], ...accs.map((a) => [a])];

  const rand = ctx.rand;
  const out = [];
  for (const base of bases)
    for (const sh of shoeOpts)
      for (const ou of outerOpts)
        for (const ac of accOpts) {
          const items = [...base, ...sh, ...ou, ...ac];
          let total = items.reduce((sum, w) => sum + sc(w), 0) / items.length; // medie, ca ținutele mai lungi să nu câștige automat
          total += colorScore(items);
          if (needsOuter && ou.length === 0 && outers.length) total -= 3;
          if (ac.length) total += 0.3;
          total += rand() * 0.6;
          out.push({ items, score: total });
        }
  return out.sort((a, b) => b.score - a.score);
}

export const outfitName = (occasion) => OCCASION_NAME[occasion] ?? "Ținută nouă";

// Ținuta zilei: aceeași pentru aceeași zi/ocazie/variantă; "Altă sugestie" crește varianta
export function pickToday(candidates, variant) {
  const uniq = dedupeByBase(candidates);
  return uniq[variant % Math.min(uniq.length, 12)];
}

// Surprinde-mă: aleatoare din combinațiile cu culori decente, alta decât cele deja arătate
export function pickSurprise(candidates, previousKeys = []) {
  const ok = candidates.filter((c) => colorScore(c.items) >= -1);
  const pool = (ok.length ? ok : candidates).filter((c) => !previousKeys.includes(keyOf(c.items)));
  const list = pool.length ? pool : candidates;
  return list[Math.floor(Math.random() * list.length)];
}

export const keyOf = (items) => items.map((w) => w.id).sort().join("-");

// sugestiile consecutive să difere prin piesele principale, nu doar prin accesoriu/geacă/pantofi
function dedupeByBase(cands) {
  const seen = new Set();
  const out = [];
  for (const c of cands) {
    const k = c.items.filter((w) => !["ACCESSORY", "OUTERWEAR", "SHOES"].includes(w.catalogItem.category)).map((w) => w.id).sort().join("-");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

export { rng };
