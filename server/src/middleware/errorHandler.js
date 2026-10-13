import { HttpError } from "../utils/httpError.js";

export const notFound = (_req, _res, next) => next(new HttpError(404, "NOT_FOUND", "Ruta nu există."));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "JSON invalid." } });
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Eroare de server." } });
}
