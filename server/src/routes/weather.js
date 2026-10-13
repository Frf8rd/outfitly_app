import { Router } from "express";
import { current } from "../controller/weather.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { weatherQuerySchema } from "../validators/app.schema.js";

const r = Router();
r.get("/", requireAuth, validateQuery(weatherQuerySchema), current);
export default r;
