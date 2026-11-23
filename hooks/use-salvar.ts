import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSalvar<T>(enviar: (dados: T) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enviar,
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
