// Tipuri comune (se aliniază cu schema Prisma din server).
export type Category = "TOP" | "BOTTOM" | "DRESS" | "OUTERWEAR" | "SHOES" | "ACCESSORY";

export type Occasion = "EVERYDAY" | "SCHOOL" | "DATE" | "PARTY" | "VACATION" | "WORK";

export type Weather = {
  temperature: number; // °C
  condition: "clear" | "cloudy" | "rain" | "snow";
  summary: string; // ex: "Cer senin"
  city: string;
};

export type OutfitPiece = {
  id: string;
  name: string;
  category: Category;
  imageUrl?: string; // URL de la server (catalog)
  image?: number; // imagine locală: require("@/assets/clothes/pulover.png")
};

export type OutfitSuggestion = {
  name: string;
  occasion: Occasion;
  items: OutfitPiece[];
  isFavorite: boolean;
};