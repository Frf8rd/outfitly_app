import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/config/db.js";
import { ensureChallenges } from "../src/services/challenges.service.js";

// Populează catalogul global din catalog.seed.json. Se poate rula de mai multe ori: articolele se identifică după NUME.
//   node prisma/seed.js           -> adaugă / actualizează
//   node prisma/seed.js --prune   -> în plus, ȘTERGE articolele din baza de date care nu mai sunt în JSON
//                                    (și din garderobele utilizatorilor, ținutele care le conțineau le pierd)
// Imaginile stau în server/public/catalog/. Dacă fișierul lipsește, imageUrl rămâne gol (aplicația arată emoji).
const items = JSON.parse(readFileSync(new URL("./catalog.seed.json", import.meta.url), "utf8"));
const publicDir = fileURLToPath(new URL("../public", import.meta.url));

let created = 0;
let updated = 0;
const missing = [];
for (const raw of items) {
  const hasImage = raw.imageUrl && existsSync(publicDir + raw.imageUrl);
  if (raw.imageUrl && !hasImage) missing.push(raw.imageUrl);
  const item = { ...raw, imageUrl: hasImage ? raw.imageUrl : "" };

  const existing = await prisma.catalogItem.findFirst({ where: { name: item.name } });
  if (existing) {
    await prisma.catalogItem.update({ where: { id: existing.id }, data: item });
    updated++;
  } else {
    await prisma.catalogItem.create({ data: item });
    created++;
  }
}
console.log(`Catalog: ${created} create, ${updated} actualizate.`);
if (missing.length) console.log(`Imagini lipsă (${missing.length}):\n  ${missing.join("\n  ")}`);

if (process.argv.includes("--prune")) {
  const obsolete = await prisma.catalogItem.findMany({ where: { name: { notIn: items.map((i) => i.name) } }, select: { id: true, name: true } });
  if (obsolete.length) {
    const ids = obsolete.map((o) => o.id);
    const w = await prisma.wardrobeItem.deleteMany({ where: { catalogItemId: { in: ids } } });
    await prisma.catalogItem.deleteMany({ where: { id: { in: ids } } });
    console.log(`Șterse ${obsolete.length} articole vechi (și ${w.count} rânduri din garderobe).`);
  }
}

await ensureChallenges();
console.log("Provocări: săptămâna curentă și următoarea sunt create.");
await prisma.$disconnect();