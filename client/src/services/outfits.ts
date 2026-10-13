import { api, qs } from "@/services/api";
import { toPiece } from "@/services/wardrobe";
import type { SavedOutfit } from "@/components/outfit/OutfitCard";
import type { Occasion, Outfit, OutfitSource } from "@/types/models";

export type OutfitParams = { favorite?: boolean; occasion?: Occasion };
export type OutfitInput = { name: string; occasion: Occasion; wardrobeItemIds: string[]; source?: OutfitSource; isFavorite?: boolean };
export type OutfitPatch = Partial<Pick<OutfitInput, "name" | "occasion" | "wardrobeItemIds">> & { isFavorite?: boolean };

// Forma pe care o așteaptă componentele de UI (OutfitCard, OutfitPreview).
export const toSaved = (o: Outfit): SavedOutfit => ({
  id: o.id,
  name: o.name,
  occasion: o.occasion,
  isFavorite: o.isFavorite,
  items: o.items.map(toPiece),
});

export const getOutfits = (p: OutfitParams = {}) =>
  api<{ items: Outfit[] }>(`/outfits${qs({ favorite: p.favorite, occasion: p.occasion })}`).then((r) => r.items);

export const getOutfit = (id: string) => api<Outfit>(`/outfits/${id}`);
export const createOutfit = (body: OutfitInput) => api<Outfit>("/outfits", { method: "POST", body });
export const updateOutfit = (id: string, body: OutfitPatch) => api<Outfit>(`/outfits/${id}`, { method: "PATCH", body });
export const deleteOutfit = (id: string) => api<null>(`/outfits/${id}`, { method: "DELETE" });
export const wearOutfit = (id: string) => api<{ id: string; wornOn: string }>(`/outfits/${id}/wear`, { method: "POST" });
