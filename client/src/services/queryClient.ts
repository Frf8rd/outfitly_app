import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/services/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // nu reîncerca erorile 4xx (date greșite / neautorizat), doar problemele de rețea / 5xx, o singură dată
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});
