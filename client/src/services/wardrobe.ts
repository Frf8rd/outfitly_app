import { api, qs } from "@/services/api";
import type { Category, OutfitPiece, WardrobeItem } from "@/types/models";

export const getWardrobe = (category?: Category) =>
  api<{ items: WardrobeItem[] }>(`/wardrobe${qs({ category })}`).then((r) => r.items);

export const addToWardrobe = (catalogItemIds: string[]) =>
  api<{ added: number }>("/wardrobe/bulk", { method: "POST", body: { catalogItemIds } });

export const removeFromWardrobe = (id: string) => api<null>(`/wardrobe/${id}`, { method: "DELETE" });

// Forma pe care o așteaptă componentele de UI (ClothingCard, OutfitPreview...). id = id-ul rândului din garderobă.
export const toPiece = (w: WardrobeItem): OutfitPiece => ({
  id: w.id,
  name: w.catalogItem.name,
  category: w.catalogItem.category,
  imageUrl: w.catalogItem.imageUrl || undefined,
});
