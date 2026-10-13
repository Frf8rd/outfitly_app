import { Router } from "express";
import { prisma } from "../config/db.js";

const router = Router();

// GET /api/health -> serverul rulează
router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// GET /api/health/db -> serverul reușește să vorbească cu Neon
router.get("/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  } catch (e) {
    console.error("DB health check a eșuat:", e.message);
    res.status(503).json({ error: { code: "DB_DOWN", message: "Baza de date nu răspunde." } });
  }
});

export default router;
