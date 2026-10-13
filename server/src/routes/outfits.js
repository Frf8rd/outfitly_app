import { Router } from "express";
import * as c from "../controller/outfits.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { createOutfitSchema, outfitQuerySchema, updateOutfitSchema } from "../validators/outfit.schema.js";

const r = Router();
r.use(requireAuth);
r.get("/", validateQuery(outfitQuerySchema), c.list);
r.post("/", validate(createOutfitSchema), c.create);
r.get("/:id", c.getOne);
r.patch("/:id", validate(updateOutfitSchema), c.update);
r.delete("/:id", c.remove);
r.post("/:id/wear", c.wear);
export default r;
