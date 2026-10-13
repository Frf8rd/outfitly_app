import { api, qs } from "@/services/api";
import type { CatalogItem, Category, Paginated } from "@/types/models";

export type CatalogParams = { category?: Category; search?: string; color?: string; style?: string; page?: number; limit?: number };

export const getCatalog = (p: CatalogParams = {}) =>
  api<Paginated<CatalogItem>>(`/catalog${qs({ ...p, limit: p.limit ?? 100 })}`);
