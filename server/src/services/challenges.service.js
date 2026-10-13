import { prisma } from "../config/db.js";

// Provocările se rotesc singure: 2 pe săptămână + prima din săptămâna următoare ca „viitoare”. Nu e nevoie de cron.
const TEMPLATES = [
  { title: "O ținută monocromă", description: "Combină piese din aceeași culoare într-o singură ținută.", icon: "trophy-outline" },
  { title: "Poartă ceva ce n-ai purtat luna asta", description: "Alege o haină uitată în garderobă și dă-i o a doua șansă.", icon: "footsteps-outline" },
  { title: "O săptămână fără cumpărături", description: "Fă ținute noi doar din ce ai deja.", icon: "leaf-outline" },
  { title: "Look de weekend", description: "O ținută relaxată, dar îngrijită, pentru weekend.", icon: "sunny-outline" },
  { title: "O culoare nouă", description: "Încearcă o ținută cu o culoare pe care o porți rar.", icon: "color-palette-outline" },
  { title: "Straturi", description: "Poartă o ținută cu cel puțin trei straturi.", icon: "layers-outline" },
];

const DAY = 864e5;
const WEEK = 7 * DAY;

// luni 00:00 UTC al săptămânii care conține data dată
export const weekStart = (d = new Date()) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
};

export async function ensureChallenges(now = new Date()) {
  const start = weekStart(now);
  const w = Math.floor(start.getTime() / WEEK);
  const mk = (weekIdx, startsAt, n) =>
    [0, 1].slice(0, n).map((k) => ({ ...TEMPLATES[(2 * weekIdx + k) % TEMPLATES.length], startsAt, endsAt: new Date(startsAt.getTime() + WEEK - 1) }));
  const next = new Date(start.getTime() + WEEK);
  await prisma.challenge.createMany({ data: [...mk(w, start, 2), ...mk(w + 1, next, 1)], skipDuplicates: true });
}

// status: DONE (finalizată), ACTIVE (te-ai alăturat), AVAILABLE (în desfășurare, nealăturată), UPCOMING
export function challengeOut(c, uc, now = new Date()) {
  const total = Math.max(1, Math.round((c.endsAt - c.startsAt) / DAY));
  const day = Math.min(total, Math.max(1, Math.floor((now - c.startsAt) / DAY) + 1));
  const status = uc?.status === "COMPLETED" ? "DONE" : c.startsAt > now ? "UPCOMING" : uc ? "ACTIVE" : "AVAILABLE";
  return {
    id: c.id, title: c.title, description: c.description, icon: c.icon,
    startsAt: c.startsAt, endsAt: c.endsAt, status,
    joined: !!uc, day: status === "DONE" ? total : status === "UPCOMING" ? 0 : day, total,
  };
}
