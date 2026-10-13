// Date de test folosite de pagini până avem server. Se șterg când paginile folosesc API-ul.
import { CLOTHES } from "@/constants/clothes";
import type { SavedOutfit } from "@/components/outfit/OutfitCard";
import type { OutfitPiece, Weather } from "@/types/models";

export const MOCK_WEATHER: Weather = { temperature: 18, condition: "clear", summary: "Cer senin", city: "Chișinău" };

export const MOCK_WARDROBE: OutfitPiece[] = [
  { id: "w1", name: "Tricou alb", category: "TOP" },
  { id: "w2", name: "Pulover verde", category: "TOP", image: CLOTHES.pulover },
  { id: "w3", name: "Blugi", category: "BOTTOM" },
  { id: "w4", name: "Pantaloni crem", category: "BOTTOM", image: CLOTHES.pantaloni },
  { id: "w5", name: "Fustă neagră", category: "BOTTOM" },
  { id: "w6", name: "Rochie florală", category: "DRESS" },
  { id: "w7", name: "Jachetă denim", category: "OUTERWEAR" },
  { id: "w8", name: "Sneakers", category: "SHOES", image: CLOTHES.adidasi },
  { id: "w9", name: "Geantă bej", category: "ACCESSORY" },
];

const w = (id: string) => MOCK_WARDROBE.find((p) => p.id === id)!;

export const MOCK_OUTFITS: SavedOutfit[] = [
  { id: "1", name: "Look casual", occasion: "EVERYDAY", isFavorite: true, items: [w("w2"), w("w4"), w("w8")] },
  { id: "2", name: "Office look", occasion: "WORK", isFavorite: false, items: [w("w1"), w("w5")] },
  { id: "3", name: "Seară de vară", occasion: "PARTY", isFavorite: true, items: [w("w6"), w("w9")] },
  { id: "4", name: "Prima întâlnire", occasion: "DATE", isFavorite: false, items: [w("w2"), w("w3"), w("w7")] },
];