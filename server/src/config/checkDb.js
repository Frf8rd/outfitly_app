import { prisma } from "./db.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Verifică dacă serverul reușește să vorbească cu baza de date (Neon).
// Neon își oprește baza când nu e folosită, iar prima conexiune poate dura câteva secunde sau poate eșua,
// de aceea încercăm de mai multe ori înainte să renunțăm.
export async function checkDbConnection({ attempts = 3, delayMs = 2000 } = {}) {
  let lastError;

  for (let i = 1; i <= attempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Conectat la baza de date (Neon)");
      return true;
    } catch (e) {
      lastError = e;
      console.warn(`⚠️  Conectare la baza de date eșuată (încercarea ${i}/${attempts}): ${e.message}`);
      if (i < attempts) await wait(delayMs);
    }
  }

  console.error("❌ Nu mă pot conecta la baza de date. Verifică DATABASE_URL din server/.env și conexiunea la internet.");
  console.error(lastError);
  return false;
}