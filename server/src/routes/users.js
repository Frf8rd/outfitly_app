import { Router } from "express";
import { deleteMe, updateMe } from "../controller/users.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateMeSchema } from "../validators/auth.schema.js";

const r = Router();
r.use(requireAuth);
r.patch("/me", validate(updateMeSchema), updateMe);
r.delete("/me", deleteMe);
export default r;
