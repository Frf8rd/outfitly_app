import { z } from "zod";

const OCCASIONS = ["EVERYDAY", "SCHOOL", "DATE", "PARTY", "VACATION", "WORK"];
const STYLES = ["CASUAL", "SPORT", "ELEGANT", "STREETWEAR", "COQUETTE"];

const lat = z.coerce.number().min(-90, "Latitudine invalidă.").max(90, "Latitudine invalidă.");
const lon = z.coerce.number().min(-180, "Longitudine invalidă.").max(180, "Longitudine invalidă.");

export const styleQuizSchema = z.object({
  answers: z.array(z.enum(STYLES)).min(1, "Răspunde la cel puțin o întrebare.").max(20),
});

export const weatherQuerySchema = z.object({ lat, lon });

export const todayQuerySchema = z.object({
  occasion: z.enum(OCCASIONS).default("EVERYDAY"),
  lat: lat.optional(),
  lon: lon.optional(),
  variant: z.coerce.number().int().min(0).max(1000).default(0),
});

export const surpriseSchema = z.object({
  occasion: z.enum(OCCASIONS).default("EVERYDAY"),
  previousKeys: z.array(z.string().max(500)).max(20).default([]),
});

export const wearLogsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
