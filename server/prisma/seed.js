import "dotenv/config";
import { readFileSync } from "node:fs";
import { prisma } from "../src/config/db.js";

// Populează catalogul global. Se poate rula de mai multe ori: articolele se identifică după nume + culoare.
// imageUrl gol = aplicația arată un emoji; pune PNG-uri în server/public/catalog/ și completează "imageUrl" în catalog.seed.json.
const items = JSON.parse(readFileSync(new URL("./catalog.seed.json", import.meta.url), "utf8"));

let created = 0;
let updated = 0;
for (const item of items) {
  const existing = await prisma.catalogItem.findFirst({ where: { name: item.name, color: item.color } });
  if (existing) {
    await prisma.catalogItem.update({ where: { id: existing.id }, data: item });
    updated++;
  } else {
    await prisma.catalogItem.create({ data: item });
    created++;
  }
}
console.log(`Catalog: ${created} create, ${updated} actualizate.`);
await prisma.$disconnect();
