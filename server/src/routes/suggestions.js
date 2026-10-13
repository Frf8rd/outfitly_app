import { Router } from "express";
import * as c from "../controller/suggestions.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { surpriseSchema, todayQuerySchema } from "../validators/app.schema.js";

const r = Router();
r.use(requireAuth);
r.get("/today", validateQuery(todayQuerySchema), c.today);
r.post("/surprise", validate(surpriseSchema), c.surprise);
export default r;
