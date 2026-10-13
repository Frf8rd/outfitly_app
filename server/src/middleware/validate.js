import { HttpError } from "../utils/httpError.js";

// validate(schema) validează req.body cu zod și îl înlocuiește cu datele curate.
export const validate = (schema) => (req, _res, next) => {
  const r = schema.safeParse(req.body ?? {});
  if (!r.success) return next(new HttpError(400, "VALIDATION_ERROR", r.error.issues[0]?.message ?? "Date invalide."));
  req.body = r.data;
  next();
};

// validateQuery(schema): la fel, dar pentru req.query (rezultatul curat ajunge în req.validQuery).
export const validateQuery = (schema) => (req, _res, next) => {
  const r = schema.safeParse(req.query ?? {});
  if (!r.success) return next(new HttpError(400, "VALIDATION_ERROR", r.error.issues[0]?.message ?? "Parametri invalizi."));
  req.validQuery = r.data;
  next();
};
