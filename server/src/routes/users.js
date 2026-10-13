import { Router } from "express";
import { deleteMe, saveStyleQuiz, updateMe } from "../controller/users.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateMeSchema } from "../validators/auth.schema.js";
import { styleQuizSchema } from "../validators/app.schema.js";

const r = Router();
r.use(requireAuth);
r.patch("/me", validate(updateMeSchema), updateMe);
r.put("/me/style-quiz", validate(styleQuizSchema), saveStyleQuiz);
r.delete("/me", deleteMe);
export default r;
