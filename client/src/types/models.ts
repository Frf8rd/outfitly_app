// Tipuri comune (se aliniază cu schema Prisma din server).
export type Category = "TOP" | "BOTTOM" | "DRESS" | "OUTERWEAR" | "SHOES" | "ACCESSORY";

export type Style = "CASUAL" | "SPORT" | "ELEGANT" | "STREETWEAR" | "COQUETTE";

export type Occasion = "EVERYDAY" | "SCHOOL" | "DATE" | "PARTY" | "VACATION" | "WORK";

export type OutfitSource = "MANUAL" | "TODAY" | "SURPRISE";

export type Weather = {
  temperature: number; // °C
  condition: "clear" | "cloudy" | "rain" | "snow";
  summary: string; // ex: "Cer senin"
  city: string;
};

// Ce afișează componentele de UI (ClothingCard, OutfitPreview...). Serviciile transformă răspunsurile API în acest tip.
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

// ---- Forma răspunsurilor API (contractul din README, secțiunea 8). Ajustează-le când scrii serverul. ----

export type User = {
  id: string;
  name: string;
  email: string;
  mainStyle?: Style | null;
};

export type CatalogItem = {
  id: string;
  name: string;
  category: Category;
  subtype: string; // "tricou", "blugi", "sneakers"
  color: string; // "alb", "negru"
  styles: Style[];
  warmth: number; // 1..5
  waterproof: boolean;
  imageUrl: string;
  owned?: boolean; // vine doar de la GET /catalog
};

export type WardrobeItem = {
  id: string; // id-ul rândului din garderobă (nu al articolului din catalog)
  addedAt: string;
  catalogItem: CatalogItem;
};

export type Outfit = {
  id: string;
  name: string;
  occasion: Occasion;
  source: OutfitSource;
  isFavorite: boolean;
  createdAt: string;
  items: WardrobeItem[];
};

export type Stats = {
  wardrobeCount: number;
  outfitCount: number;
  unwornCount: number; // haine nepurtate în ultimele 30 de zile
  wornOutfitCount: number;
};

// Lista paginată de la GET /catalog
export type Paginated<T> = { items: T[]; page: number; limit: number; total: number };


// ---- Faza 3-4 ----
export type WeatherData = { temperature: number; condition: Weather["condition"]; summary: string };

// Sugestie de la GET /suggestions/today și POST /suggestions/surprise (nu e salvată pe server până o salvezi ca ținută)
export type Suggestion = {
  key: string; // identifică combinația de piese
  name: string;
  occasion: Occasion;
  weather: WeatherData | null;
  items: WardrobeItem[];
};

export type WearLog = { id: string; wornOn: string; outfit: Outfit };

export type ChallengeStatus = "ACTIVE" | "AVAILABLE" | "DONE" | "UPCOMING";
export type Challenge = {
  id: string;
  title: string;
  description: string;
  icon: string; // nume Ionicons
  startsAt: string;
  endsAt: string;
  status: ChallengeStatus;
  joined: boolean;
  day: number;
  total: number;
};
