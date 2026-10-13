import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOutfit, deleteOutfit, getOutfit, getOutfits, updateOutfit, wearOutfit,
  type OutfitParams, type OutfitPatch,
} from "@/services/outfits";

export const useOutfits = (params: OutfitParams = {}) =>
  useQuery({ queryKey: ["outfits", "list", params], queryFn: () => getOutfits(params) });

export const useOutfit = (id: string | undefined) =>
  useQuery({ queryKey: ["outfits", "one", id], queryFn: () => getOutfit(id!), enabled: !!id });

function useRefresh() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: ["outfits"] }), qc.invalidateQueries({ queryKey: ["stats"] })]);
}

export function useCreateOutfit() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: createOutfit, onSuccess: refresh });
}

export function useUpdateOutfit() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: ({ id, ...patch }: OutfitPatch & { id: string }) => updateOutfit(id, patch), onSuccess: refresh });
}

export function useDeleteOutfit() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: deleteOutfit, onSuccess: refresh });
}

// Ținuta purtată alimentează jurnalul, statisticile și evitarea repetițiilor din sugestii
export function useWearOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: wearOutfit,
    onSuccess: () =>
      Promise.all(["wearlogs", "stats", "suggestions"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}
