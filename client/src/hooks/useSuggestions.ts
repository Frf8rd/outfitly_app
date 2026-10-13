import { useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { getCoords, type Coords } from "@/services/location";
import { getSurprise, getTodaySuggestion, getWeather } from "@/services/suggestions";
import { useCreateOutfit, useUpdateOutfit } from "@/hooks/useOutfits";
import type { Occasion, OutfitSource, Suggestion } from "@/types/models";

// Locația nu dă niciodată eroare (la refuz folosim Chișinăul), deci ecranele pot aștepta doar `data`.
export const useCoords = () => useQuery({ queryKey: ["coords"], queryFn: getCoords, staleTime: 15 * 60_000, retry: false });

const at = (c?: Coords) => [c?.lat.toFixed(2), c?.lon.toFixed(2)];

export const useWeather = (coords?: Coords) =>
  useQuery({
    queryKey: ["weather", ...at(coords)],
    queryFn: () => getWeather(coords!.lat, coords!.lon),
    enabled: !!coords,
    staleTime: 10 * 60_000,
  });

export const useTodaySuggestion = (occasion: Occasion, variant: number, coords?: Coords) =>
  useQuery({
    queryKey: ["suggestions", "today", occasion, variant, ...at(coords)],
    queryFn: () => getTodaySuggestion({ occasion, variant, lat: coords?.lat, lon: coords?.lon }),
    enabled: !!coords,
    placeholderData: keepPreviousData, // la „Altă sugestie” rămâne vechea ținută până vine următoarea
  });

export const useSurprise = () => useMutation({ mutationFn: getSurprise });

// O sugestie nu există pe server până n-o salvezi. Hook-ul o salvează ca ținută (o singură dată per combinație)
// când o dai la favorite sau deschizi detaliile.
export function useSuggestionOutfit(suggestion: Suggestion | undefined, source: OutfitSource) {
  const create = useCreateOutfit();
  const update = useUpdateOutfit();
  const [saved, setSaved] = useState<{ key: string; id: string; isFavorite: boolean } | null>(null);
  const current = suggestion && saved?.key === suggestion.key ? saved : null;

  async function ensureSaved(isFavorite = false): Promise<string> {
    if (!suggestion) throw new Error("Nu există nicio sugestie.");
    if (current) return current.id;
    const o = await create.mutateAsync({
      name: suggestion.name,
      occasion: suggestion.occasion,
      source,
      isFavorite,
      wardrobeItemIds: suggestion.items.map((i) => i.id),
    });
    setSaved({ key: suggestion.key, id: o.id, isFavorite });
    return o.id;
  }

  async function toggleFavorite() {
    if (!suggestion || create.isPending || update.isPending) return;
    if (!current) {
      await ensureSaved(true);
      return;
    }
    const next = !current.isFavorite;
    await update.mutateAsync({ id: current.id, isFavorite: next });
    setSaved({ ...current, isFavorite: next });
  }

  return { isFavorite: current?.isFavorite ?? false, ensureSaved, toggleFavorite, busy: create.isPending || update.isPending };
}
