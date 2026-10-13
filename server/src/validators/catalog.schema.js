import { z } from "zod";

const CATEGORIES = ["TOP", "BOTTOM", "DRESS", "OUTERWEAR", "SHOES", "ACCESSORY"];
const STYLES = ["CASUAL", "SPORT", "ELEGANT", "STREETWEAR", "COQUETTE"];

export const catalogQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  style: z.enum(STYLES).optional(),
  color: z.string().trim().max(30).optional(),
  search: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const wardrobeQuerySchema = z.object({ category: z.enum(CATEGORIES).optional() });

export const addWardrobeSchema = z.object({ catalogItemId: z.string().min(1) });
export const bulkWardrobeSchema = z.object({
  catalogItemIds: z.array(z.string().min(1)).min(1, "Alege cel puțin un articol.").max(100),
});
