import { useQuery } from "@tanstack/react-query";
import { getDoadoras, getDoadora } from "@/services/doadoras";
import type { Doadora } from "@/types/doadora";

export function useDoadoras() {
  const query = useQuery<Doadora[]>({
    queryKey: ["doadoras"],
    queryFn: getDoadoras,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoadora(id: string) {
  return useQuery<Doadora>({
    queryKey: ["doadoras", id],
    queryFn: () => getDoadora(id),
    enabled: Boolean(id),
  });
}
