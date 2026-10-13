import { Router } from "express";
import * as c from "../controller/challenges.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);
r.get("/current", c.current);
r.post("/:id/join", c.join);
r.post("/:id/complete", c.complete);
export default r;
