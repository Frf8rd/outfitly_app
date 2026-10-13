import { Router } from "express";
import { list } from "../controller/wearlogs.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { wearLogsQuerySchema } from "../validators/app.schema.js";

const r = Router();
r.get("/", requireAuth, validateQuery(wearLogsQuerySchema), list);
export default r;
