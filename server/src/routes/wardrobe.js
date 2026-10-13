import { Router } from "express";
import * as c from "../controller/wardrobe.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { addWardrobeSchema, bulkWardrobeSchema, wardrobeQuerySchema } from "../validators/catalog.schema.js";

const r = Router();
r.use(requireAuth);
r.get("/", validateQuery(wardrobeQuerySchema), c.list);
r.post("/", validate(addWardrobeSchema), c.add);
r.post("/bulk", validate(bulkWardrobeSchema), c.bulkAdd);
r.delete("/:id", c.remove);
export default r;
