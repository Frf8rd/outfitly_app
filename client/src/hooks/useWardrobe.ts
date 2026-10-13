import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToWardrobe, getWardrobe, removeFromWardrobe } from "@/services/wardrobe";

export const useWardrobe = () => useQuery({ queryKey: ["wardrobe"], queryFn: () => getWardrobe() });

// După orice schimbare, reîncărcăm garderoba, catalogul (câmpul "owned") și ținutele (un articol scos dispare din ținute).
function useRefreshing() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["wardrobe"] }),
      qc.invalidateQueries({ queryKey: ["catalog"] }),
      qc.invalidateQueries({ queryKey: ["outfits"] }),
      qc.invalidateQueries({ queryKey: ["suggestions"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
    ]);
}

export function useAddToWardrobe() {
  const refresh = useRefreshing();
  return useMutation({ mutationFn: addToWardrobe, onSuccess: refresh });
}

export function useRemoveFromWardrobe() {
  const refresh = useRefreshing();
  return useMutation({ mutationFn: removeFromWardrobe, onSuccess: refresh });
}
