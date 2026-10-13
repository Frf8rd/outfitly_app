import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCatalog, type CatalogParams } from "@/services/catalog";

export const useCatalog = (params: CatalogParams) =>
  useQuery({
    queryKey: ["catalog", params],
    queryFn: () => getCatalog(params),
    placeholderData: keepPreviousData, // lista nu "clipește" când scrii în căutare
  });
