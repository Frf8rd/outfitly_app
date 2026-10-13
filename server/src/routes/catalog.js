import { Router } from "express";
import * as c from "../controller/catalog.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { catalogQuerySchema } from "../validators/catalog.schema.js";

const r = Router();
r.use(requireAuth);
r.get("/", validateQuery(catalogQuerySchema), c.list);
r.get("/:id", c.getOne);
export default r;
