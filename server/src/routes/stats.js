import { Router } from "express";
import { get } from "../controller/stats.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.get("/", requireAuth, get);
export default r;
