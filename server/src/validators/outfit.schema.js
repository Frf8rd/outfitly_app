import { z } from "zod";

const OCCASIONS = ["EVERYDAY", "SCHOOL", "DATE", "PARTY", "VACATION", "WORK"];
const SOURCES = ["MANUAL", "TODAY", "SURPRISE"];

const name = z.string().trim().min(2, "Numele e prea scurt (minim 2 caractere).").max(60, "Numele e prea lung (maxim 60 de caractere).");
const itemIds = z.array(z.string().min(1)).min(1, "Alege cel puțin un articol.").max(12, "Maxim 12 articole într-o ținută.");

export const outfitQuerySchema = z.object({
  favorite: z.enum(["true", "false"]).optional(),
  occasion: z.enum(OCCASIONS).optional(),
});

export const createOutfitSchema = z.object({
  name,
  occasion: z.enum(OCCASIONS).default("EVERYDAY"),
  source: z.enum(SOURCES).default("MANUAL"),
  isFavorite: z.boolean().default(false),
  wardrobeItemIds: itemIds,
});

export const updateOutfitSchema = z
  .object({
    name: name.optional(),
    occasion: z.enum(OCCASIONS).optional(),
    isFavorite: z.boolean().optional(),
    wardrobeItemIds: itemIds.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nimic de actualizat.");
